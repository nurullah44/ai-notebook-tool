<?php

namespace App\Console\Commands;

use App\Support\SqliteRecovery;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Throwable;

class RestoreNotebook extends Command
{
    protected $signature = 'notebook:restore
        {backup : Verified SQLite backup file}
        {--database= : Target SQLite database path}
        {--force : Confirm destructive replacement of the target database}';

    protected $description = 'Restore and verify the notebook from a SQLite backup';

    public function handle(SqliteRecovery $recovery): int
    {
        if (! $this->option('force')) {
            $this->error('Restore requires --force.');

            return self::FAILURE;
        }

        $backupPath = (string) $this->argument('backup');
        $targetPath = (string) ($this->option('database') ?: config('database.connections.sqlite.database'));
        $safetyBackupDirectory = storage_path('app/private/backups');

        DB::purge('sqlite');

        try {
            $restore = $recovery->restore($backupPath, $targetPath, $safetyBackupDirectory);
        } catch (Throwable $exception) {
            $this->error('Restore failed: '.$exception->getMessage());

            return self::FAILURE;
        }

        $this->info('Restore complete.');
        $this->line('Target: '.$restore['path']);
        if ($restore['safetyBackupPath'] !== null) {
            $this->line('Previous database backup: '.$restore['safetyBackupPath']);
        }
        $this->line('Integrity: '.$restore['integrity']);
        $this->line('Notes: '.$restore['noteCount']);

        return self::SUCCESS;
    }
}
