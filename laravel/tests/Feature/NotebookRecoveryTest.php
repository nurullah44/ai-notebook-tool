<?php

namespace Tests\Feature;

use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SQLite3;
use Tests\TestCase;

class NotebookRecoveryTest extends TestCase
{
    /** @var array<int, string> */
    private array $temporaryDirectories = [];

    protected function tearDown(): void
    {
        foreach ($this->temporaryDirectories as $directory) {
            $paths = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::CHILD_FIRST,
            );

            foreach ($paths as $path) {
                $path->isDir() ? rmdir($path->getPathname()) : unlink($path->getPathname());
            }

            rmdir($directory);
        }

        parent::tearDown();
    }

    public function test_backup_command_creates_a_consistent_verified_sqlite_copy(): void
    {
        $directory = $this->temporaryDirectory();
        $sourcePath = $directory.'/source.sqlite';
        $backupDirectory = $directory.'/backups';
        mkdir($backupDirectory);
        $source = $this->createDatabase($sourcePath, ['first', 'second']);

        $this->artisan('notebook:backup', [
            '--database' => $sourcePath,
            '--destination' => $backupDirectory,
        ])->assertSuccessful()
            ->expectsOutputToContain('Backup complete.')
            ->expectsOutputToContain('Integrity: ok')
            ->expectsOutputToContain('Notes: 2');

        $backups = glob($backupDirectory.'/notebook-*.db');
        $this->assertIsArray($backups);
        $this->assertCount(1, $backups);

        $backup = new SQLite3($backups[0], SQLITE3_OPEN_READONLY);
        $this->assertSame('ok', $backup->querySingle('PRAGMA integrity_check'));
        $this->assertSame(2, $backup->querySingle('SELECT COUNT(*) FROM notes'));

        $backup->close();
        $source->close();
    }

    public function test_restore_requires_force_and_rehearses_replacement_on_copied_data(): void
    {
        $directory = $this->temporaryDirectory();
        $backupPath = $directory.'/chosen-backup.sqlite';
        $targetPath = $directory.'/restore-target.sqlite';
        $this->app->useStoragePath($directory.'/storage');
        $backup = $this->createDatabase($backupPath, ['first', 'second']);
        $target = $this->createDatabase($targetPath, ['temporary']);
        $backup->close();
        $target->close();

        $this->artisan('notebook:restore', [
            'backup' => $backupPath,
            '--database' => $targetPath,
        ])->assertFailed()
            ->expectsOutputToContain('Restore requires --force.');

        $unchanged = new SQLite3($targetPath, SQLITE3_OPEN_READONLY);
        $this->assertSame(1, $unchanged->querySingle('SELECT COUNT(*) FROM notes'));
        $unchanged->close();

        $this->artisan('notebook:restore', [
            'backup' => $backupPath,
            '--database' => $targetPath,
            '--force' => true,
        ])->assertSuccessful()
            ->expectsOutputToContain('Restore complete.')
            ->expectsOutputToContain('Integrity: ok')
            ->expectsOutputToContain('Notes: 2');

        $restored = new SQLite3($targetPath, SQLITE3_OPEN_READONLY);
        $this->assertSame('ok', $restored->querySingle('PRAGMA integrity_check'));
        $this->assertSame(2, $restored->querySingle('SELECT COUNT(*) FROM notes'));
        $restored->close();

        $safetyBackups = glob($directory.'/storage/app/private/backups/notebook-pre-restore-*.db');
        $this->assertIsArray($safetyBackups);
        $this->assertCount(1, $safetyBackups);
        $this->assertSame([], glob($directory.'/notebook-pre-restore-*.db'));

        $safety = new SQLite3($safetyBackups[0], SQLITE3_OPEN_READONLY);
        $this->assertSame(1, $safety->querySingle('SELECT COUNT(*) FROM notes'));
        $safety->close();
    }

    public function test_restore_rejects_an_invalid_backup_before_touching_the_target(): void
    {
        $directory = $this->temporaryDirectory();
        $backupPath = $directory.'/invalid-backup.sqlite';
        $targetPath = $directory.'/restore-target.sqlite';
        $invalidBackup = new SQLite3($backupPath);
        $invalidBackup->exec('CREATE TABLE unrelated (id TEXT PRIMARY KEY)');
        $invalidBackup->close();
        $target = $this->createDatabase($targetPath, ['untouched']);
        $target->close();

        $this->artisan('notebook:restore', [
            'backup' => $backupPath,
            '--database' => $targetPath,
            '--force' => true,
        ])->assertFailed()
            ->expectsOutputToContain('Restore failed:');

        $unchanged = new SQLite3($targetPath, SQLITE3_OPEN_READONLY);
        $this->assertSame('untouched', $unchanged->querySingle('SELECT id FROM notes'));
        $unchanged->close();
        $this->assertSame([], glob($directory.'/notebook-pre-restore-*.db'));
    }

    public function test_failed_backup_verification_removes_the_ambiguous_artifact(): void
    {
        $directory = $this->temporaryDirectory();
        $sourcePath = $directory.'/invalid-source.sqlite';
        $backupDirectory = $directory.'/backups';
        mkdir($backupDirectory);
        $source = new SQLite3($sourcePath);
        $source->exec('CREATE TABLE unrelated (id TEXT PRIMARY KEY)');
        $source->close();

        $this->artisan('notebook:backup', [
            '--database' => $sourcePath,
            '--destination' => $backupDirectory,
        ])->assertFailed()
            ->expectsOutputToContain('Backup failed:');

        $this->assertSame([], glob($backupDirectory.'/notebook-*.db'));
    }

    /** @param array<int, string> $ids */
    private function createDatabase(string $path, array $ids): SQLite3
    {
        $database = new SQLite3($path);
        $database->exec('PRAGMA journal_mode=WAL');
        $database->exec('CREATE TABLE notes (id TEXT PRIMARY KEY, title TEXT NOT NULL DEFAULT \'\', body TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)');

        $statement = $database->prepare('INSERT INTO notes (id, title, body, created_at, updated_at) VALUES (:id, \'\', \'body\', \'2026-08-08T00:00:00.000Z\', \'2026-08-08T00:00:00.000Z\')');
        foreach ($ids as $id) {
            $statement->bindValue(':id', $id, SQLITE3_TEXT);
            $statement->execute();
        }

        return $database;
    }

    private function temporaryDirectory(): string
    {
        $directory = sys_get_temp_dir().'/idea-store-recovery-'.bin2hex(random_bytes(8));
        mkdir($directory);
        $this->temporaryDirectories[] = $directory;

        return $directory;
    }
}
