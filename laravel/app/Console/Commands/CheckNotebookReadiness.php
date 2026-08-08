<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use PDO;
use SQLite3;
use Throwable;

class CheckNotebookReadiness extends Command
{
    protected $signature = 'notebook:ready
        {--production : Also enforce production-only HTTPS and debug settings}';

    protected $description = 'Check secret-safe Laravel notebook runtime readiness';

    public function handle(): int
    {
        $checks = [
            'APP_KEY' => $this->hasString(config('app.key')),
            'AUTH_PASSWORD' => $this->hasString(config('founder.password')),
            'EXTENSION_CAPTURE_TOKEN' => $this->hasString(config('services.extension.capture_token')),
            'PDO SQLite driver' => in_array('sqlite', PDO::getAvailableDrivers(), true),
            'SQLite3 extension' => class_exists(SQLite3::class),
            'physical SQLite database' => $this->databaseIsReady(),
            'private storage' => $this->privateStorageIsReady(),
        ];

        if ($this->option('production')) {
            $checks += [
                'APP_ENV=production' => config('app.env') === 'production',
                'APP_DEBUG=false' => config('app.debug') === false,
                'HTTPS APP_URL' => parse_url((string) config('app.url'), PHP_URL_SCHEME) === 'https',
                'secure session cookie' => config('session.secure') === true,
            ];
        }

        $failed = false;
        foreach ($checks as $label => $passed) {
            if ($passed) {
                $this->line('PASS '.$label);

                continue;
            }

            $failed = true;
            $this->error('FAIL '.$label);
        }

        $this->line($this->hasString(config('services.openai.key'))
            ? 'INFO OpenAI configured'
            : 'INFO OpenAI not configured; local fallback remains available');

        if ($failed) {
            $this->error('Laravel readiness checks failed.');

            return self::FAILURE;
        }

        $this->info($this->option('production')
            ? 'Laravel is ready for production deployment checks.'
            : 'Laravel is ready for local primary use.');

        return self::SUCCESS;
    }

    private function databaseIsReady(): bool
    {
        $path = config('database.connections.sqlite.database');
        if (! is_string($path) || $path === '' || $path === ':memory:' || ! is_file($path) || ! is_readable($path) || ! is_writable($path)) {
            return false;
        }

        try {
            $database = new SQLite3($path, SQLITE3_OPEN_READONLY);

            try {
                if ($database->querySingle('PRAGMA integrity_check') !== 'ok') {
                    return false;
                }

                $columns = [];
                $result = $database->query('PRAGMA table_info(notes)');
                while ($result !== false && ($row = $result->fetchArray(SQLITE3_ASSOC)) !== false) {
                    $columns[] = $row['name'];
                }

                $indexExists = $database->querySingle("SELECT COUNT(*) FROM sqlite_master WHERE type = 'index' AND name = 'idx_notes_updated_at'") === 1;

                return $columns === ['id', 'title', 'body', 'created_at', 'updated_at'] && $indexExists;
            } finally {
                $database->close();
            }
        } catch (Throwable) {
            return false;
        }
    }

    private function privateStorageIsReady(): bool
    {
        $path = storage_path('app/private/backups');

        try {
            return (is_dir($path) || mkdir($path, 0700, true)) && is_writable($path);
        } catch (Throwable) {
            return false;
        }
    }

    private function hasString(mixed $value): bool
    {
        return is_string($value) && trim($value) !== '';
    }
}
