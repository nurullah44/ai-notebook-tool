<?php

namespace Tests\Feature;

use Tests\TestCase;

class AuthTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config()->set('founder.password', 'correct-horse-battery-staple');
    }

    public function test_guest_is_redirected_from_home_to_login(): void
    {
        $this->get('/')
            ->assertRedirect('/login');
    }

    public function test_guest_can_view_the_login_form(): void
    {
        $this->get('/login')
            ->assertOk()
            ->assertSee('Idea Store')
            ->assertSee('name="password"', false);
    }

    public function test_wrong_password_returns_to_login_without_authenticating(): void
    {
        $this->post('/api/login', ['password' => 'wrong-password'])
            ->assertRedirect('/login?error=wrong')
            ->assertSessionMissing('founder_authenticated');
    }

    public function test_correct_password_authenticates_and_regenerates_the_session(): void
    {
        $sessionIdBeforeLogin = session()->getId();

        $this->post('/api/login', ['password' => 'correct-horse-battery-staple'])
            ->assertRedirect('/')
            ->assertSessionHas('founder_authenticated', true);

        $this->assertNotSame($sessionIdBeforeLogin, session()->getId());
    }

    public function test_authenticated_user_is_redirected_away_from_login(): void
    {
        $this->withSession(['founder_authenticated' => true])
            ->get('/login')
            ->assertRedirect('/');
    }

    public function test_logout_invalidates_the_session(): void
    {
        $this->withSession(['founder_authenticated' => true])
            ->post('/api/logout')
            ->assertRedirect('/login')
            ->assertSessionMissing('founder_authenticated');
    }
}
