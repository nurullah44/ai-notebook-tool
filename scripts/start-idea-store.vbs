Option Explicit

Dim shell
Set shell = CreateObject("WScript.Shell")

Function IdeaStoreIsReady()
  Dim request
  On Error Resume Next
  Set request = CreateObject("MSXML2.ServerXMLHTTP.6.0")
  request.setTimeouts 500, 500, 500, 500
  request.open "GET", "http://localhost:4318/login", False
  request.send
  IdeaStoreIsReady = (Err.Number = 0 And request.status = 200 And InStr(request.responseText, "Idea Store") > 0)
  Err.Clear
  On Error GoTo 0
End Function

If Not IdeaStoreIsReady() Then
  shell.CurrentDirectory = "C:\Users\Nurullah\Documents\development\codex\idea Store\laravel"
  shell.Run "cmd.exe /c """"C:\Users\Nurullah\AppData\Local\Programs\Composer\composer.bat"" start""", 0, False
End If
