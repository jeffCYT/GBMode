/* This module handles connections between the following components:
  + LSP Server
  + WebViewPanel
  + Extension main
 */

import * as vscode from "vscode";

// var status = Disconnected | Connecting | Connected;

function stop() {
    // return destroy();
}


function sendRequest(request) {
    /** case status
     * Disconnected => start(); sendRequest()
     * Connecting => push(request) into queue?
     * Connected => LSPClient.onReady(); LSPClient.sendRequest(request)
     */
}

function onNotification() {
}

function onError() {
}

function start() {
    /** case status
     * Connected => OK() from LSP
     * Connecting => keep promise()
     * Disconnected => LSPClient.make();
     */
}