<?php

namespace App\Controller;

use Doctrine\DBAL\Connection;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/health', name: 'health_')]
class HealthController extends AbstractController
{
    public function __construct(
        private Connection $connection
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

    /**
     * Endpoint temporaire pour vider le cache en production
     */
    #[Route('/clear-cache', name: 'clear_cache', methods: ['GET', 'POST'])]
    public function clearCache(): JsonResponse
    {
        try {
            $output = [];
            $returnVar = 0;
            
            $command = 'php ' . $this->getParameter('kernel.project_dir') . '/bin/console cache:clear --env=prod --no-debug 2>&1';
            exec($command, $output, $returnVar);
            
            if ($returnVar === 0) {
                return new JsonResponse([
                    'status' => 'ok',
                    'message' => 'Cache vidé avec succès',
                    'output' => implode("\n", $output),
                    'timestamp' => date('c')
                ]);
            } else {
                return new JsonResponse([
                    'status' => 'error',
                    'message' => 'Erreur lors du vidage du cache',
                    'output' => implode("\n", $output),
                    'return_code' => $returnVar,
                    'timestamp' => date('c')
                ], Response::HTTP_INTERNAL_SERVER_ERROR);
            }
        } catch (\Exception $e) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Exception lors du vidage du cache',
                'error' => $e->getMessage(),
                'timestamp' => date('c')
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    #[Route('/logs', name: 'logs', methods: ['GET'])]
    public function viewLogs(): JsonResponse
    {
        $projectDir = $this->getParameter('kernel.project_dir');
        $logDir = $projectDir . '/var/log';
        
        if (!is_dir($logDir)) {
            @mkdir($logDir, 0755, true);
        }
        
        $logs = [];
        
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
                    }
                }
            }
        }
        
        return new JsonResponse([
            'status' => 'ok',
            'log_directory' => $logDir,
            'log_directory_exists' => is_dir($logDir),
            'log_directory_writable' => is_writable($logDir),
            'php_error_log_path' => ini_get('error_log'),
            'logs_found' => count($logs),
            'all_logs_info' => array_map(function($log) {
                return [
                    'path' => $log['path'],
                    'size' => $log['size'],
                    'modified' => $log['modified'],
                    'lines_count' => count($log['last_lines'])
                ];
            }, $logs),
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
        
        return round(($end - $start) * 1000, 2);
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
