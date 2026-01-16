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
        $logDir = $this->getParameter('kernel.project_dir') . '/var/log';
        $logs = [];
        
        // Chercher les fichiers de logs Symfony
        if (is_dir($logDir)) {
            $logFiles = glob($logDir . '/*.log');
            foreach ($logFiles as $logFile) {
                $fileName = basename($logFile);
                // Lire les 100 dernières lignes
                $lines = file($logFile);
                if ($lines) {
                    $lastLines = array_slice($lines, -100);
                    $logs[$fileName] = [
                        'size' => filesize($logFile),
                        'modified' => date('c', filemtime($logFile)),
                        'last_lines' => $lastLines
                    ];
                }
            }
        }
        
        // Chercher aussi dans les logs PHP error_log
        $phpErrorLog = ini_get('error_log');
        if ($phpErrorLog && file_exists($phpErrorLog)) {
            $lines = file($phpErrorLog);
            if ($lines) {
                $lastLines = array_slice($lines, -100);
                $logs['php_error_log'] = [
                    'path' => $phpErrorLog,
                    'size' => filesize($phpErrorLog),
                    'modified' => date('c', filemtime($phpErrorLog)),
                    'last_lines' => $lastLines
                ];
            }
        }
        
        // Filtrer les logs WhatsApp uniquement
        $whatsappLogs = [];
        foreach ($logs as $fileName => $logData) {
            $whatsappLines = array_filter($logData['last_lines'], function($line) {
                return stripos($line, 'WhatsApp') !== false || 
                       stripos($line, 'Twilio') !== false ||
                       stripos($line, 'sendWhatsAppNotifications') !== false ||
                       stripos($line, 'sendTemplateMessage') !== false;
            });
            
            if (!empty($whatsappLines)) {
                $whatsappLogs[$fileName] = [
                    'path' => $logData['path'] ?? $fileName,
                    'size' => $logData['size'],
                    'modified' => $logData['modified'],
                    'whatsapp_lines' => array_values($whatsappLines)
                ];
            }
        }
        
        return new JsonResponse([
            'status' => 'ok',
            'log_directory' => $logDir,
            'logs_found' => count($logs),
            'whatsapp_logs' => $whatsappLogs,
            'all_logs' => $logs,
            'timestamp' => date('c')
        ]);
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
