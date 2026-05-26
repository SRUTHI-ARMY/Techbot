// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); 
const axios = require('axios'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server); 

// --- Configuration ---
const PORT = 3000;
const SPAM_API_URL = 'http://localhost:5001/check_spam'; 

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

// Serve the static frontend file (index.html)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// --- CORE REAL-TIME CHAT LOGIC WITH CONDITIONAL SPAM CHECK ---
io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);
    
    // Event: 'confirm send' (User confirms sending a flagged message)
    socket.on('confirm send', (originalMessage) => {
        io.emit('chat message', { 
            user: socket.id + " (Confirmed)", 
            text: originalMessage, 
            status: 'confirmed_spam',
            time: getCurrentTime()
        });
    });

    // Event: 'chat message' (The main message handler)
    socket.on('chat message', async (data) => {
        const msg = data.text;
        const contactType = data.contactType;
        
        console.log(`Received message: "${msg}" | Contact Type: ${contactType}`);

        // 1. CONDITIONAL CHECK: Skip spam detection for 'saved' contacts
        if (contactType === 'saved') {
            io.emit('chat message', { user: socket.id, text: msg, status: 'sent', time: getCurrentTime() });
            return;
        }
        
        // --- UNKNOWN CONTACTS (SPAM CHECK) ---
        try {
            const response = await axios.post(SPAM_API_URL, { message: msg });
            const analysis = response.data.analysis;
            
            // 1. Check if SPAM
            if (analysis.is_spam_risk) {
                // ASK SENDER (show modal in sender's browser)
                socket.emit('spam warning', {
                    originalMessage: msg,
                    analysis: analysis
                });

                // Also broadcast the message (so spammer thinks it went through)
                io.emit('chat message', { 
                    user: socket.id, 
                    text: msg, 
                    status: 'sent',
                    time: getCurrentTime()
                });
                
                // Notify receivers (yellow warning box will be shown by clients)
                socket.broadcast.emit('spam_alert_to_receiver', {
                    analysis: analysis,
                    senderSocketId: socket.id,
                });

            } else {
                // If safe, broadcast normally
                io.emit('chat message', { user: socket.id, text: msg, status: 'sent', time: getCurrentTime() });
            }

        } catch (error) {
            // CRASH FALLBACK: Correctly handles API failure
            console.error("Error communicating with spam API:", error.message);
            
            // Send system error message (to everyone)
            io.emit('chat message', { 
                user: 'System', 
                text: `[System Error] Spam check failed. Message sent unscreened.`, 
                status: 'error_checked' ,
                time: getCurrentTime()
            });
            
            // Broadcast the original message (as a fallback)
            io.emit('chat message', { 
                user: socket.id, 
                text: data.text, 
                status: 'sent',
                time: getCurrentTime()
            });
        }
    });

    // Event: 'disconnect' (Properly placed outside the message handler)
    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
    });
});

// Start the HTTP server
server.listen(PORT, () => {
    console.log(`Messaging server listening on http://localhost:${PORT}`);
});