<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\NoteController;
use Illuminate\Support\Facades\Route;

Route::get('/', [NoteController::class, 'index'])->middleware('founder');
Route::get('/notes/{id}', [NoteController::class, 'show'])->middleware('founder');

Route::get('/login', [AuthController::class, 'showLogin']);
Route::post('/api/login', [AuthController::class, 'login']);
Route::post('/api/logout', [AuthController::class, 'logout']);
