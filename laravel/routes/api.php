<?php

use App\Http\Controllers\CaptureController;
use Illuminate\Support\Facades\Route;

Route::post('/capture', CaptureController::class);
