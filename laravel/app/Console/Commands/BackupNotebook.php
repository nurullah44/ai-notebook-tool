<?php

namespace App\Console\Commands;

use App\Support\SqliteRecovery;
use Illuminate\Console\Command;
use Throwable;

class BackupNotebook extends Command
{
    protected $signature = 'notebook:backup
        {--database= : Source SQLite database path}
        {--destination= : Directory for timestamped backups}';

    protected $description = 'Create and verify a consistent SQLite notebook backup';

    public function handle(SqliteRecovery $recovery): int
    {
        $sourcePath = (string) ($this->option('database') ?: config('database.connections.sqlite.database'));
        $destinationDirectory = (string) ($this->option('destination') ?: storage_path('app/private/backups'));

        try {
            $backup = $recovery->backup($sourcePath, $destinationDirectory);
        } catch (Throwable $exception) {
            $this->error('Backup failed: '.$exception->getMessage());

            return self::FAILURE;
        }

        $this->info('Backup complete.');
        $this->line('Path: '.$backup['path']);
        $this->line('Integrity: '.$backup['integrity']);
        $this->line('Notes: '.$backup['noteCount']);

        return self::SUCCESS;
    }
}
