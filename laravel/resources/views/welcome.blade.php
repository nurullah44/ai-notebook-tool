<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Idea Store</title>
        <link rel="stylesheet" href="{{ asset('css/app.css') }}">
    </head>
    <body>
        <main>
            <h1>Idea Store</h1>
            <p>Laravel foundation is running.</p>
            <form action="/api/logout" method="post">
                @csrf
                <button type="submit">Log out</button>
            </form>
        </main>
    </body>
</html>
