<?php

namespace App\Controller;

use App\Service\WhatsAppService;
use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/health', name: 'health_')]
class HealthController extends AbstractController
{
    public function __construct(
        private Connection $connection,
        private ?WhatsAppService $whatsAppService = null
    ) {
    }

    #[Route('', name: 'check', methods: ['GET'])]
    public function healthCheck(): JsonResponse
    {
        $checks = [
            'status' => 'ok',
            'timestamp' => date('c'),
            'version' => '1.0.0',
            'environment' => $this->getParameter('kernel.environment'),
            'checks' => [
                'database' => $this->checkDatabase(),
                'filesystem' => $this->checkFilesystem(),
                'memory' => $this->checkMemory(),
            ]
        ];

        $allHealthy = array_reduce($checks['checks'], function ($carry, $check) {
            return $carry && $check['status'] === 'ok';
        }, true);

        $httpStatus = $allHealthy ? Response::HTTP_OK : Response::HTTP_SERVICE_UNAVAILABLE;
        $checks['status'] = $allHealthy ? 'ok' : 'error';

        return new JsonResponse($checks, $httpStatus);
    }

    #[Route('/database', name: 'database', methods: ['GET'])]
    public function databaseCheck(): JsonResponse
    {
        $check = $this->checkDatabase();
        $httpStatus = $check['status'] === 'ok' ? Response::HTTP_OK : Response::HTTP_SERVICE_UNAVAILABLE;
        
        return new JsonResponse($check, $httpStatus);
    }

    #[Route('/simple', name: 'simple', methods: ['GET'])]
    public function simpleCheck(): JsonResponse
    {
        return new JsonResponse([
            'status' => 'ok',
            'message' => 'TaxiBiker API is running',
            'timestamp' => date('c')
        ]);
    }

    #[Route('/whatsapp', name: 'whatsapp', methods: ['GET'])]
    public function whatsappCheck(): JsonResponse
    {
        if (!$this->whatsAppService) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'WhatsApp service not available',
                'error' => 'Service not injected'
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        try {
            $status = $this->whatsAppService->getConfigurationStatus();
            
            return new JsonResponse([
                'status' => $status['enabled'] ? 'ok' : 'warning',
                'message' => $status['enabled'] 
                    ? 'WhatsApp service is configured' 
                    : 'WhatsApp service is not configured',
                'configuration' => $status,
                'timestamp' => date('c')
            ]);
        } catch (\Exception $e) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Error checking WhatsApp configuration',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/logs', name: 'logs', methods: ['GET'])]
    public function viewLogs(): JsonResponse
    {
        // Endpoint temporaire pour voir les logs - À SUPPRIMER EN PRODUCTION
        $projectDir = $this->getParameter('kernel.project_dir');
        $logDir = $projectDir . '/var/log';
        
        // Créer le dossier log s'il n'existe pas
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }
        
        $logs = [];
        $whatsappLogs = [];
        
        // Chercher les fichiers de logs Symfony
        if (is_dir($logDir)) {
            $logFiles = glob($logDir . '/*.log');
            foreach ($logFiles as $logFile) {
                $fileName = basename($logFile);
                if (file_exists($logFile) && is_readable($logFile)) {
                    $lines = file($logFile);
                    if ($lines) {
                        $lastLines = array_slice($lines, -200);
                        $logs[$fileName] = [
                            'path' => $logFile,
                            'size' => filesize($logFile),
                            'modified' => date('c', filemtime($logFile)),
                            'last_lines' => $lastLines
                        ];
                        
                        // Filtrer les logs WhatsApp
                        $whatsappLines = array_filter($lastLines, function($line) {
                            return stripos($line, 'WhatsApp') !== false || 
                                   stripos($line, 'Twilio') !== false ||
                                   stripos($line, 'sendWhatsAppNotifications') !== false ||
                                   stripos($line, 'sendTemplateMessage') !== false ||
                                   stripos($line, 'DÉBUT sendWhatsAppNotifications') !== false ||
                                   stripos($line, 'Envoi template') !== false ||
                                   stripos($line, 'ERREUR') !== false;
                        });
                        
                        if (!empty($whatsappLines)) {
                            $whatsappLogs[$fileName] = [
                                'path' => $logFile,
                                'size' => filesize($logFile),
                                'modified' => date('c', filemtime($logFile)),
                                'whatsapp_lines' => array_values($whatsappLines)
                            ];
                        }
                    }
                }
            }
        }
        
        // Chercher dans plusieurs emplacements possibles pour PHP error_log
        $possibleLogPaths = [
            ini_get('error_log'),
            $projectDir . '/error_log',
            $projectDir . '/php_error_log',
            '/home/ueeecgbbue/logs/error_log',
            '/home/ueeecgbbue/public_html/error_log',
        ];
        
        foreach ($possibleLogPaths as $phpErrorLog) {
            if ($phpErrorLog && file_exists($phpErrorLog) && is_readable($phpErrorLog)) {
                $lines = @file($phpErrorLog);
                if ($lines) {
                    $lastLines = array_slice($lines, -200);
                    $logs['php_error_log_' . basename($phpErrorLog)] = [
                        'path' => $phpErrorLog,
                        'size' => filesize($phpErrorLog),
                        'modified' => date('c', filemtime($phpErrorLog)),
                        'last_lines' => $lastLines
                    ];
                    
                    // Filtrer les logs WhatsApp - prendre aussi les lignes autour des erreurs
                    $whatsappLines = [];
                    foreach ($lastLines as $index => $line) {
                        if (stripos($line, 'WhatsApp') !== false || 
                            stripos($line, 'Twilio') !== false ||
                            stripos($line, 'sendWhatsAppNotifications') !== false ||
                            stripos($line, 'sendTemplateMessage') !== false ||
                            stripos($line, 'DÉBUT sendWhatsAppNotifications') !== false ||
                            stripos($line, 'Envoi template') !== false ||
                            stripos($line, 'ERREUR') !== false ||
                            stripos($line, 'Template name') !== false ||
                            stripos($line, 'Parameters') !== false ||
                            stripos($line, 'Code:') !== false ||
                            stripos($line, 'Message:') !== false ||
                            stripos($line, 'Response:') !== false) {
                            // Prendre aussi les 2 lignes avant et après pour contexte
                            for ($i = max(0, $index - 2); $i <= min(count($lastLines) - 1, $index + 2); $i++) {
                                if (!in_array($lastLines[$i], $whatsappLines)) {
                                    $whatsappLines[] = $lastLines[$i];
                                }
                            }
                        }
                    }
                    
                    if (!empty($whatsappLines)) {
                        $whatsappLogs['php_error_log_' . basename($phpErrorLog)] = [
                            'path' => $phpErrorLog,
                            'size' => filesize($phpErrorLog),
                            'modified' => date('c', filemtime($phpErrorLog)),
                            'whatsapp_lines' => array_values($whatsappLines)
                        ];
                    }
                }
                break; // Prendre le premier trouvé
            }
        }
        
        return new JsonResponse([
            'status' => 'ok',
            'log_directory' => $logDir,
            'log_directory_exists' => is_dir($logDir),
            'log_directory_writable' => is_writable($logDir),
            'php_error_log_path' => ini_get('error_log'),
            'logs_found' => count($logs),
            'whatsapp_logs_found' => count($whatsappLogs),
            'whatsapp_logs' => $whatsappLogs,
            'all_logs_info' => array_map(function($log) {
                return [
                    'path' => $log['path'],
                    'size' => $log['size'],
                    'modified' => $log['modified'],
                    'lines_count' => count($log['last_lines'])
                ];
            }, $logs),
            'timestamp' => date('c'),
            'note' => 'Les logs error_log() PHP peuvent être dans les logs Apache/Nginx. Vérifiez aussi cPanel -> Error Logs'
        ]);
    }

    #[Route('/whatsapp/check-number', name: 'whatsapp_check_number', methods: ['GET'])]
    public function checkWhatsAppNumber(): JsonResponse
    {
        if (!$this->whatsAppService) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'WhatsApp service not available'
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        try {
            $status = $this->whatsAppService->getConfigurationStatus();
            $whatsappNumber = $status['whatsapp_number'] ?? null;
            
            if (!$whatsappNumber) {
                return new JsonResponse([
                    'status' => 'error',
                    'message' => 'WhatsApp number not configured'
                ]);
            }

            // Tenter de vérifier le statut du numéro via Twilio API
            $accountSid = $_ENV['TWILIO_ACCOUNT_SID'] ?? null;
            $authToken = $_ENV['TWILIO_AUTH_TOKEN'] ?? null;
            
            if (!$accountSid || !$authToken) {
                return new JsonResponse([
                    'status' => 'error',
                    'message' => 'Twilio credentials not configured',
                    'whatsapp_number' => $whatsappNumber
                ]);
            }

            try {
                $client = new \Twilio\Rest\Client($accountSid, $authToken);
                
                // Vérifier les numéros de téléphone dans le compte
                $incomingNumbers = $client->incomingPhoneNumbers->read([], 20);
                $numberFound = false;
                $numberInfo = null;
                
                foreach ($incomingNumbers as $number) {
                    if ($number->phoneNumber === $whatsappNumber) {
                        $numberFound = true;
                        $numberInfo = [
                            'phone_number' => $number->phoneNumber,
                            'friendly_name' => $number->friendlyName,
                            'status' => 'found_in_account',
                            'capabilities' => [
                                'sms' => $number->capabilities['sms'] ?? false,
                                'voice' => $number->capabilities['voice'] ?? false,
                                'mms' => $number->capabilities['mms'] ?? false,
                            ]
                        ];
                        break;
                    }
                }
                
                return new JsonResponse([
                    'status' => 'ok',
                    'whatsapp_number' => $whatsappNumber,
                    'number_found_in_account' => $numberFound,
                    'number_info' => $numberInfo,
                    'instructions' => [
                        'to_activate_whatsapp' => [
                            '1' => 'Go to Twilio Console → Phone Numbers → Manage → Active numbers',
                            '2' => "Click on $whatsappNumber",
                            '3' => 'Go to "Messaging" tab',
                            '4' => 'Enable/Check "WhatsApp" option',
                            '5' => 'Or go to Messaging → Try it out → Send a WhatsApp message',
                            '6' => 'Or go to Messaging → Senders → WhatsApp senders and add the number'
                        ]
                    ]
                ]);
                
            } catch (\Exception $e) {
                return new JsonResponse([
                    'status' => 'error',
                    'message' => 'Error checking number status',
                    'error' => $e->getMessage(),
                    'whatsapp_number' => $whatsappNumber,
                    'instructions' => [
                        '1' => 'Go to Twilio Console → Phone Numbers → Manage → Active numbers',
                        '2' => "Find and click on $whatsappNumber",
                        '3' => 'Make sure WhatsApp is enabled in the Messaging tab'
                    ]
                ]);
            }
            
        } catch (\Exception $e) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Error checking WhatsApp configuration',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/logs/whatsapp', name: 'whatsapp_logs', methods: ['GET'])]
    public function viewWhatsAppLogs(): JsonResponse
    {
        // Endpoint spécialisé pour les logs WhatsApp - affiche les dernières lignes complètes
        $logFile = $this->getParameter('kernel.project_dir') . '/var/log/whatsapp_debug.log';
        
        if (!file_exists($logFile)) {
            return new JsonResponse([
                'status' => 'ok',
                'message' => 'Fichier de log WhatsApp non trouvé',
                'log_file' => $logFile,
                'lines' => []
            ]);
        }
        
        // Lire les 100 dernières lignes
        $lines = file($logFile);
        if (!$lines) {
            return new JsonResponse([
                'status' => 'ok',
                'message' => 'Fichier de log vide',
                'log_file' => $logFile,
                'lines' => []
            ]);
        }
        
        $lastLines = array_slice($lines, -100);
        
        return new JsonResponse([
            'status' => 'ok',
            'log_file' => $logFile,
            'file_size' => filesize($logFile),
            'total_lines' => count($lines),
            'showing_last' => count($lastLines),
            'last_modified' => date('c', filemtime($logFile)),
            'lines' => array_map('trim', $lastLines)
        ]);
    }

    #[Route('/whatsapp/check-number', name: 'whatsapp_check_number', methods: ['GET'])]
    public function checkWhatsAppNumber(): JsonResponse
    {
        if (!$this->whatsAppService) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'WhatsApp service not available'
            ], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        try {
            $status = $this->whatsAppService->getConfigurationStatus();
            $whatsappNumber = $status['whatsapp_number'] ?? null;
            
            if (!$whatsappNumber) {
                return new JsonResponse([
                    'status' => 'error',
                    'message' => 'WhatsApp number not configured'
                ]);
            }

            // Instructions pour activer le numéro dans Twilio Console
            return new JsonResponse([
                'status' => 'ok',
                'whatsapp_number' => $whatsappNumber,
                'instructions_to_activate' => [
                    'method_1' => [
                        'title' => 'Via Phone Numbers',
                        'steps' => [
                            '1. Go to Twilio Console → Phone Numbers → Manage → Active numbers',
                            '2. Click on ' . $whatsappNumber,
                            '3. Go to "Messaging" tab',
                            '4. Enable/Check "WhatsApp" option',
                            '5. Save changes'
                        ]
                    ],
                    'method_2' => [
                        'title' => 'Via Messaging Settings',
                        'steps' => [
                            '1. Go to Messaging → Try it out → Send a WhatsApp message',
                            '2. Or go to Messaging → Senders → WhatsApp senders',
                            '3. Check if ' . $whatsappNumber . ' appears in the list',
                            '4. If not, click "Add WhatsApp Sender" or "Request WhatsApp Access"'
                        ]
                    ],
                    'method_3' => [
                        'title' => 'If number is not compatible with WhatsApp',
                        'steps' => [
                            '1. Go to Phone Numbers → Buy a number',
                            '2. Search for a WhatsApp-compatible number',
                            '3. Select "Messaging" and "WhatsApp" capabilities',
                            '4. Purchase the number',
                            '5. Update TWILIO_WHATSAPP_NUMBER in your .env file'
                        ]
                    ]
                ],
                'check_url' => 'https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn',
                'note' => 'After activating the number in Twilio Console, the error 63007 should disappear'
            ]);
            
        } catch (\Exception $e) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Error checking WhatsApp configuration',
                'error' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function checkDatabase(): array
    {
        try {
            $this->connection->executeQuery('SELECT 1');
            return [
                'status' => 'ok',
                'message' => 'Database connection successful',
                'response_time' => $this->measureExecutionTime(function () {
                    $this->connection->executeQuery('SELECT 1');
                })
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Database connection failed',
                'error' => $e->getMessage()
            ];
        }
    }

    private function checkFilesystem(): array
    {
        try {
            $varDir = $this->getParameter('kernel.project_dir') . '/var';
            $cacheDir = $varDir . '/cache';
            $logDir = $varDir . '/log';

            $checks = [
                'var_writable' => is_writable($varDir),
                'cache_writable' => is_writable($cacheDir),
                'log_writable' => is_writable($logDir),
            ];

            $allWritable = array_reduce($checks, function ($carry, $writable) {
                return $carry && $writable;
            }, true);

            return [
                'status' => $allWritable ? 'ok' : 'error',
                'message' => $allWritable ? 'Filesystem permissions OK' : 'Filesystem permission issues',
                'details' => $checks
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Filesystem check failed',
                'error' => $e->getMessage()
            ];
        }
    }

    private function checkMemory(): array
    {
        $memoryLimit = ini_get('memory_limit');
        $memoryUsage = memory_get_usage(true);
        $memoryPeak = memory_get_peak_usage(true);
        
        // Convertir la limite de mémoire en bytes
        $memoryLimitBytes = $this->convertToBytes($memoryLimit);
        $memoryUsagePercent = ($memoryUsage / $memoryLimitBytes) * 100;

        return [
            'status' => $memoryUsagePercent < 80 ? 'ok' : 'warning',
            'message' => sprintf('Memory usage: %.2f%%', $memoryUsagePercent),
            'details' => [
                'limit' => $memoryLimit,
                'usage' => $this->formatBytes($memoryUsage),
                'peak' => $this->formatBytes($memoryPeak),
                'usage_percent' => round($memoryUsagePercent, 2)
            ]
        ];
    }

    private function measureExecutionTime(callable $callback): float
    {
        $start = microtime(true);
        $callback();
        $end = microtime(true);
        
        return round(($end - $start) * 1000, 2); // en millisecondes
    }

    private function convertToBytes(string $value): int
    {
        $value = trim($value);
        $last = strtolower($value[strlen($value) - 1]);
        $value = (int) $value;

        switch ($last) {
            case 'g':
                $value *= 1024 * 1024 * 1024;
                break;
            case 'm':
                $value *= 1024 * 1024;
                break;
            case 'k':
                $value *= 1024;
                break;
        }

        return $value;
    }

    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
