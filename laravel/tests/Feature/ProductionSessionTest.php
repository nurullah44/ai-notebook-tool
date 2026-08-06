<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Log;
use PHPUnit\Framework\Attributes\RunInSeparateProcess;
use Tests\TestCase;

class ProductionSessionTest extends TestCase
{
    protected function setUp(): void
    {
        $_ENV['APP_ENV'] = 'production';
        $_SERVER['APP_ENV'] = 'production';

        parent::setUp();

        config()->set('founder.password', 'correct-horse-battery-staple');
        Log::spy();
    }

    #[RunInSeparateProcess]
    public function test_production_login_issues_a_secure_session_cookie(): void
    {
        $response = $this->post('/api/login', [
            'password' => 'correct-horse-battery-staple',
        ]);

        $cookies = implode('; ', $response->headers->all('set-cookie'));

        $this->assertStringContainsString('secure', strtolower($cookies));
    }
}
