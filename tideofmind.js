let ws;
        let connectionStatus = "Connecting...";
        
        // WebSocket functions
        function connectWebSocket() {
            updateConnectionStatus("Connecting...");
            
            try {
                ws = new WebSocket("wss://pixel-world.xyz:2087/ws2");
                
                ws.onopen = function(event) {
                    console.log("WebSocket connected");
                    updateConnectionStatus("Connected");
                };
                
                ws.onmessage = function(event) {
                    console.log("Received message:", event.data);
                };
                
                ws.onclose = function(event) {
                    console.log("WebSocket disconnected");
                    updateConnectionStatus("Disconnected");
                };
                
                ws.onerror = function(error) {
                    console.log("WebSocket error:", error);
                    updateConnectionStatus("Disconnected");
                };
                
            } catch (error) {
                console.log("Failed to connect:", error);
                updateConnectionStatus("Disconnected");
            }
        }
        
        function updateConnectionStatus(status) {
            connectionStatus = status;
            const statusElement = document.getElementById('connectionStatus');
            const statusText = document.getElementById('statusText');
            const reconnectContainer = document.getElementById('reconnectContainer');
            const buttons = document.querySelectorAll('.feeling-button');
            
            statusText.textContent = `Status: ${status}`;
            
            // Update styling based on status
            statusElement.className = 'connection-status';
            if (status === "Connected") {
                statusElement.classList.add('connected');
                reconnectContainer.style.display = 'none';
                buttons.forEach(btn => btn.disabled = false);
            } else if (status === "Connecting...") {
                statusElement.classList.add('connecting');
                reconnectContainer.style.display = 'none';
                buttons.forEach(btn => btn.disabled = true);
            } else {
                statusElement.classList.add('disconnected');
                reconnectContainer.style.display = 'block';
                buttons.forEach(btn => btn.disabled = true);
            }
        }
        
        let lastClickTime = 0;
        const COOLDOWN_DURATION = 10000; // 10 seconds in milliseconds
        
        function sendFeeling(feeling, emoji, displayName) {
            const currentTime = Date.now();
            if (currentTime - lastClickTime < COOLDOWN_DURATION) {
                const remainingTime = Math.ceil((COOLDOWN_DURATION - (currentTime - lastClickTime)) / 1000);
                alert(`Please wait ${remainingTime} seconds before sending another feeling.`);
                return;
            }

            if (ws && ws.readyState === WebSocket.OPEN) {
                lastClickTime = currentTime;
                const message = {
                    type: "feeling",
                    message: feeling,
                    timestamp: new Date().toISOString()
                };
                
                ws.send(JSON.stringify(message));
                console.log("Sent feeling:", message);
                
                // Show aquarium info message
                const aquariumInfo = document.getElementById('aquariumInfo');
                aquariumInfo.style.display = 'block';
                
                // Hide the message after 3 seconds
                setTimeout(() => {
                    aquariumInfo.style.display = 'none';
                }, 3000);
                
                // Visual feedback - briefly highlight the button
                const buttonMap = {'1': 'surprise', '2': 'sad', '3': 'happy', '4': 'fearful'};
                const button = document.getElementById(buttonMap[feeling] + 'Btn');
                button.style.transform = 'scale(0.95)';
                button.style.opacity = '0.7';
                
                setTimeout(() => {
                    button.style.transform = '';
                    button.style.opacity = '';
                }, 200);
                
            } else {
                console.log("WebSocket not connected");
                alert("WebSocket not connected. Please wait for connection or try reconnecting.");
            }
        }
        
        // P5.js setup (minimal, just for compatibility)
        function setup() {
            // Create a hidden canvas
            let canvas = createCanvas(1, 1);
            canvas.parent(document.body);
            canvas.style('display', 'none');
            
            // Connect to WebSocket
            connectWebSocket();
        }
        
        function draw() {
            // Empty draw function for p5.js compatibility
        }
        
        // Clean up WebSocket connection when page unloads
        window.addEventListener("beforeunload", function() {
            if (ws) {
                ws.close();
            }
        });
        
        // Auto-reconnect logic
        setInterval(() => {
            if (connectionStatus === "Disconnected") {
                console.log("Attempting to reconnect...");
                connectWebSocket();
            }
        }, 10000); // Try to reconnect every 10 seconds
