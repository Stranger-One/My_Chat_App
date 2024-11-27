import jwt from 'jsonwebtoken'


const getUserDetailsFromToken = async (token) => {
    
    if(!token) return null

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
    // console.log(decoded);
    return decoded

};


export default getUserDetailsFromToken;