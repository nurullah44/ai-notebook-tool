<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Login - Idea Store</title>
        <link rel="stylesheet" href="{{ asset('css/login.css') }}">
    </head>
    <body>
        <main class="loginPage">
            <section class="loginPanel" aria-labelledby="login-title">
                <div class="brandMark" aria-hidden="true">IS</div>
                <h1 id="login-title">Idea Store</h1>
                <p>Enter your private idea collection.</p>

                <form action="/api/login" method="post" class="loginForm">
                    @csrf
                    <label for="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autocomplete="current-password"
                        autofocus
                        required
                    >

                    @if ($showError)
                        <p class="errorMessage" role="alert">Wrong password. Try again.</p>
                    @endif

                    <button type="submit">Enter Idea Store</button>
                </form>
            </section>
        </main>
    </body>
</html>
