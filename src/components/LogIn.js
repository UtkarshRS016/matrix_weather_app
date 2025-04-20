import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const LogIn = () => {

 const navigate = useNavigate();

 useEffect(() => {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
   navigate('/forecast');
  }
 }, [navigate]);

 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');

 const userLogIn = (e) => {
  e.preventDefault();

  const users = JSON.parse(localStorage.getItem('users')) || [];

  const validateUser = users.find(
   (user) => (user.username === username && user.password === password)
  )

  if (localStorage.getItem('currentUser')) {
   alert("A user is already logged in. Please log out first.");
   return;
  }

  if (validateUser) {
   localStorage.setItem('currentUser', JSON.stringify(validateUser));
   alert("Logged In Successfully");
   navigate("/forecast");
  }
  else
   alert("Invalid Credentials");

 }

 return (
  <>
   <div className='md:w-[60%] w-full h-full bg-[#0E2F1B]/80 rounded-lg p-2 flex justify-center items-center flex-col'>
    <form onSubmit={userLogIn} className='bg-[#3C6845]/50 p-6 rounded-lg shadow-md w-full max-w-md'>
     <div className='mb-4'>
      <label className='text-[#E8F0EB] block mb-1'>Username</label>
      <input type='text'
       placeholder='Enter your username'
       value={username}
       onChange={(e) => setUsername(e.target.value)}
       className='text-black w-full bg-[#AFCBC4] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400' />
     </div>

     <div className='mb-4'>
      <label className='text-[#E8F0EB] block mb-1'>Password</label>
      <input type='password'
       placeholder='Enter your password'
       value={password}
       onChange={(e) => setPassword(e.target.value)}
       className='text-[rgb(3,7,18)] w-full bg-[#AFCBC4] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
      />
     </div>

     <div className='flex justify-center itecen'>
      <button className='bg-[#AFCBC4] text-[#5B6C67] hover:text-[#0E2F1B] p-2 border rounded-lg'>
       Log In
      </button>
     </div>

     <div className='text-[#5B6C67] flex justify-center items-center mt-2 cursor-pointer'>
      <p className='text-[14px]'>Not Registered yet? <span className='text-[#E8F0EB] hover:underline'
       onClick={() => navigate("/")}>Register Now.</span></p>
     </div>

    </form>
   </div>
  </>
 )
}

export default LogIn