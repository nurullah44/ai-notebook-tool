<?php

namespace App\Support;

use DateTimeImmutable;
use DateTimeZone;
use RuntimeException;
use SQLite3;
use Throwable;

class SqliteRecovery
{
    /** @return array{path: string, integrity: string, noteCount: int} */
    public function backup(string $sourcePath, string $destinationDirectory, string $prefix = 'notebook'): array
    {
        if (! is_dir($destinationDirectory) && ! mkdir($destinationDirectory, 0700, true) && ! is_dir($destinationDirectory)) {
            throw new RuntimeException('Backup directory could not be created.');
        }

        $timestamp = (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Y-m-d\TH-i-s-v\Z');
        $destinationPath = $destinationDirectory.'/'.$prefix.'-'.$timestamp.'-'.bin2hex(random_bytes(3)).'.db';

        return $this->copyAndVerify($sourcePath, $destinationPath);
    }

    /** @return array{path: string, safetyBackupPath: ?string, integrity: string, noteCount: int} */
    public function restore(string $backupPath, string $targetPath): array
    {
        $backup = $this->inspect($backupPath);
        $safetyBackupPath = null;

        if (is_file($targetPath)) {
            $safety = $this->backup($targetPath, dirname($targetPath), 'notebook-pre-restore');
            $safetyBackupPath = $safety['path'];
        }

        foreach ([$targetPath.'-wal', $targetPath.'-shm'] as $sidecarPath) {
            if (is_file($sidecarPath) && ! unlink($sidecarPath)) {
                throw new RuntimeException('SQLite sidecar could not be removed.');
            }
        }

        try {
            $restored = $this->copyAndVerify($backupPath, $targetPath, true);
        } catch (Throwable $exception) {
            if ($safetyBackupPath !== null) {
                $this->copyAndVerify($safetyBackupPath, $targetPath, true);
            }

            throw $exception;
        }

        if ($restored['noteCount'] !== $backup['noteCount']) {
            throw new RuntimeException('Restored note count does not match the backup.');
        }

        return [
            'path' => $restored['path'],
            'safetyBackupPath' => $safetyBackupPath,
            'integrity' => $restored['integrity'],
            'noteCount' => $restored['noteCount'],
        ];
    }

    /** @return array{path: string, integrity: string, noteCount: int} */
    private function copyAndVerify(string $sourcePath, string $destinationPath, bool $overwrite = false): array
    {
        $source = $this->inspect($sourcePath);

        if (! $overwrite && file_exists($destinationPath)) {
            throw new RuntimeException('Backup destination already exists.');
        }

        $destinationDirectory = dirname($destinationPath);
        if (! is_dir($destinationDirectory) && ! mkdir($destinationDirectory, 0700, true) && ! is_dir($destinationDirectory)) {
            throw new RuntimeException('Destination directory could not be created.');
        }

        $sourceDatabase = null;
        $destinationDatabase = null;

        try {
            $sourceDatabase = new SQLite3($sourcePath, SQLITE3_OPEN_READONLY);
            $destinationDatabase = new SQLite3($destinationPath, SQLITE3_OPEN_READWRITE | SQLITE3_OPEN_CREATE);

            if (! $sourceDatabase->backup($destinationDatabase)) {
                throw new RuntimeException('SQLite backup operation failed.');
            }
        } catch (Throwable $exception) {
            if (! $overwrite && is_file($destinationPath)) {
                unlink($destinationPath);
            }

            throw $exception;
        } finally {
            $destinationDatabase?->close();
            $sourceDatabase?->close();
        }

        $copy = $this->inspect($destinationPath);
        if ($copy['noteCount'] !== $source['noteCount']) {
            throw new RuntimeException('Backup note count does not match the source.');
        }

        return $copy;
    }

    /** @return array{path: string, integrity: string, noteCount: int} */
    private function inspect(string $path): array
    {
        if (! is_file($path)) {
            throw new RuntimeException('SQLite database file does not exist.');
        }

        $database = new SQLite3($path, SQLITE3_OPEN_READONLY);

        try {
            $integrity = $database->querySingle('PRAGMA integrity_check');
            if ($integrity !== 'ok') {
                throw new RuntimeException('SQLite integrity check failed.');
            }

            $noteCount = $database->querySingle('SELECT COUNT(*) FROM notes');
            if (! is_int($noteCount)) {
                throw new RuntimeException('SQLite note count could not be read.');
            }

            return [
                'path' => $path,
                'integrity' => $integrity,
                'noteCount' => $noteCount,
            ];
        } finally {
            $database->close();
        }
    }
}
