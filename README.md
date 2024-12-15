# Chat Application with Video Calling

An advanced chat application that supports real-time messaging and video calling, built using **Socket.IO** and **PeerJS**. This application offers seamless communication with a user-friendly interface and is optimized for scalability and performance.
- [Live Website Link](https://my-chat-app-1-h9wb.onrender.com/)

---

## Features

- **Real-time Messaging**: Instant text messaging powered by Socket.IO.
- **Video Calling**: High-quality video calls using PeerJS.
- **User Authentication**: Secure login and signup functionality.
- **Email Verificatio**: Send OTP to email to verify email and then only you able to start chat.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Message Read Receipts**: Shows when messages are delivered and read.
- **Online Status**: See which users are online in real-time.

---

## Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.IO, PeerJS
- **Database**: MongoDB
- **Others**: WebRTC, Cloudinary (for media uploads)

---

## Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites

- **Node.js** (v14 or later)
- **MongoDB** (local or cloud instance)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Stranger-One/My_Chat_App.git
   cd My_Chat_App
   ```

2. **Install dependencies**:

   ```bash
   cd server && npm install
   cd client && npm install
   ```

3. **Environment Variables**:
   Create a `.env` files in the root directory of each server and client folder and configure the following variables:

   ```env
   #server .env file
        PORT=<Your PORT>
        CLIENT_URL=<your client Url>
        MONGODB_URL=<your database url>
        EMAIL_PASS=<your email pass for nodemailer>
        EMAIL_USER=<your email for nodemailer>
        JWT_SECRET_KEY=<your JWT secret key>
        CLOUDINARY_CLOUD_NAME=<your cloudinary name>
        CLOUDINARY_API_KEY=<your cloudinary key>
        CLOUDINARY_SECRET_KEY=<your cloudinary secret>

    #client .env file
        VITE_BACKEND_URL=<your backend running url>
    ````    

4. **Run the application**:
- Start the backend server:
  ```bash
   cd server && npm run start
  ```
- Start the frontend client:
  ```bash
  cd client && npm run dev
  ```

5. **Access the application**:
Open `http://localhost:5173` in your browser.

---

## Usage

### Real-time Chat
- Login with your credentials.
- Start a conversation with any registered user.
- See when the other user is typing or has read your messages.

### Video Calling
- Click the video call button in an active chat to initiate a call.
- Grant camera and microphone permissions when prompted.
- Enjoy real-time video communication.

---


## Contributing

Contributions are welcome! Follow these steps:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a pull request.

---

## Acknowledgments

- [Socket.IO](https://socket.io/)
- [PeerJS](https://peerjs.com/)
- [WebRTC](https://webrtc.org/)
- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
