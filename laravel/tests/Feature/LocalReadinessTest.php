<?php

namespace Tests\Feature;

use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SQLite3;
use Tests\TestCase;

class LocalReadinessTest extends TestCase
{
    private string $temporaryDirectory;

    protected function setUp(): void
    {
        parent::setUp();

        $this->temporaryDirectory = sys_get_temp_dir().'/idea-store-ready-'.bin2hex(random_bytes(8));
        mkdir($this->temporaryDirectory);
        $this->app->useStoragePath($this->temporaryDirectory.'/storage');

        $databasePath = $this->temporaryDirectory.'/notebook.sqlite';
        $database = new SQLite3($databasePath);
        $database->exec('CREATE TABLE notes (id TEXT PRIMARY KEY, title TEXT NOT NULL DEFAULT \'\', body TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)');
        $database->exec('CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC)');
        $database->close();

        config()->set('app.key', 'base64:'.base64_encode(str_repeat('k', 32)));
        config()->set('app.cipher', 'AES-256-CBC');
        config()->set('app.env', 'local');
        config()->set('app.debug', true);
        config()->set('app.url', 'http://localhost:3000');
        config()->set('database.default', 'sqlite');
        config()->set('database.connections.sqlite.database', $databasePath);
        config()->set('founder.password', 'test-password');
        config()->set('services.extension.capture_token', 'test-capture-token');
        config()->set('session.secure', false);
    }

    protected function tearDown(): void
    {
        $paths = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($this->temporaryDirectory, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::CHILD_FIRST,
        );

        foreach ($paths as $path) {
            $path->isDir() ? rmdir($path->getPathname()) : unlink($path->getPathname());
        }

        rmdir($this->temporaryDirectory);

        parent::tearDown();
    }

    public function test_local_readiness_passes_without_exposing_secret_values(): void
    {
        $this->artisan('notebook:ready')
            ->assertSuccessful()
            ->expectsOutputToContain('Laravel is ready for local primary use.')
            ->doesntExpectOutputToContain('test-password')
            ->doesntExpectOutputToContain('test-capture-token')
            ->expectsOutputToContain('PASS default SQLite connection')
            ->expectsOutputToContain('PASS SQLite parent directory');
    }

    public function test_readiness_rejects_missing_required_config_and_memory_database(): void
    {
        config()->set('founder.password');
        config()->set('database.connections.sqlite.database', ':memory:');

        $this->artisan('notebook:ready')
            ->assertFailed()
            ->expectsOutputToContain('FAIL AUTH_PASSWORD')
            ->expectsOutputToContain('FAIL physical SQLite database');
    }

    public function test_readiness_rejects_an_unusable_app_key_and_non_sqlite_default_connection(): void
    {
        config()->set('app.key', 'base64:not-a-valid-laravel-key');
        config()->set('database.default', 'alternate');
        config()->set('database.connections.alternate', [
            'driver' => 'sqlite',
            'database' => ':memory:',
        ]);

        $this->artisan('notebook:ready')
            ->assertFailed()
            ->expectsOutputToContain('FAIL usable APP_KEY')
            ->expectsOutputToContain('FAIL default SQLite connection');
    }

    public function test_production_readiness_requires_production_https_without_debug(): void
    {
        $this->artisan('notebook:ready', ['--production' => true])
            ->assertFailed()
            ->expectsOutputToContain('FAIL APP_ENV=production')
            ->expectsOutputToContain('FAIL APP_DEBUG=false')
            ->expectsOutputToContain('FAIL HTTPS APP_URL')
            ->expectsOutputToContain('FAIL secure session cookie');

        config()->set('app.env', 'production');
        config()->set('app.debug', false);
        config()->set('app.url', 'https://ideas.example.test');
        config()->set('session.secure', true);

        $this->artisan('notebook:ready', ['--production' => true])
            ->assertSuccessful()
            ->expectsOutputToContain('Laravel is ready for production deployment checks.');
    }
}
