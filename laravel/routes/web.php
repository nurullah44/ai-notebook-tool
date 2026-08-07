<?php

use App\Http\Controllers\AiRecallController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\NoteController;
use Illuminate\Support\Facades\Route;

Route::get('/', [NoteController::class, 'index'])->middleware('founder');
Route::get('/notes/{id}', [NoteController::class, 'show'])->middleware('founder');
Route::post('/api/notes', [NoteController::class, 'store'])->middleware('founder');
Route::post('/api/notes/{id}', [NoteController::class, 'update'])->middleware('founder');
Route::post('/api/notes/{id}/delete', [NoteController::class, 'destroy'])->middleware('founder');
Route::post('/api/ai/recall', AiRecallController::class)->middleware('founder')->name('ai.recall');

Route::get('/login', [AuthController::class, 'showLogin']);
Route::post('/api/login', [AuthController::class, 'login']);
Route::post('/api/logout', [AuthController::class, 'logout']);
