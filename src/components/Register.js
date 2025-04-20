import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const Register = () => {

 const navigate = useNavigate();

 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPwd, setConfirmPwd] = useState('');

 useEffect(() => {
  const currentUser = localStorage.getItem('currentUser');
  if (currentUser) {
   navigate('/forecast');
  }
 }, [navigate]);

 function locallySubmit(e) {
  e.preventDefault();

  if (password !== confirmPwd) {
   alert("Passwords do not match");
   return
  }

  const newUser = {
   username,
   password
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];

  const usernameTaken = users.find((user) => user.username === username);

  if (usernameTaken) {
   alert("Username Already exist");
   return;
  }

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  alert('User registered successfully!');
  setUsername('');
  setPassword('');
  setConfirmPwd('');

  // onUserRegister();
  navigate('/forecast')

 }


 return (
  <>
   <div className='md:w-[60%] w-full h-full bg-[#0E2F1B]/80 rounded-lg p-2 flex justify-center items-center flex-col'>
    <form onSubmit={locallySubmit} className="bg-[#3C6845]/50 p-6 rounded-lg shadow-md w-full max-w-md">

     <div className='mb-4'>
      <label className="block text-[#E8F0EB] mb-1">Username</label>
      <input
       type="text"
       placeholder="Enter username"
       value={username}
       onChange={(e) => setUsername(e.target.value)}
       className="w-full bg-[#AFCBC4] px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-[rgb(3,7,18)]" />
     </div>

     <div className='mb-4'>
      <label className='text-[#E8F0EB] block mb-1'>Password</label>
      <input type='password'
       placeholder='Enter your password'
       value={password}
       onChange={(e) => setPassword(e.target.value)}
       className='w-full bg-[#AFCBC4] border rounded-lg px-4 py-2 text-[rgb(3,7,18)] focus:outline-none focus:ring-2 focus:ring-blue-400'
      />
     </div>

     <div className='mb-4'>
      <label className='text-[#E8F0EB] block mb-1'>Confirm Password</label>
      <input type='password'
       placeholder='Re-enter your password'
       value={confirmPwd}
       onChange={(e) => setConfirmPwd(e.target.value)}
       className='w-full bg-[#AFCBC4] border rounded-lg px-4 py-2 text-[rgb(3,7,18)] focus:outline-none focus:ring-2 focus:ring-blue-400'
      />
     </div>

     <div className='flex justify-center items-center'>
      <button type='submit'
       className='bg-[#AFCBC4] text-[#5B6C67] hover:text-[#0E2F1B] p-2 border rounded-lg'>
       Register
      </button>
     </div>

    </form>

    <div className='text-[#5B6C67] mt-2'>
     <p className='text-[14px]'>Already Registered? <span className='text-[#E8F0EB] hover:underline cursor-pointer' onClick={() => navigate("/login")}>Log In</span></p>
    </div>

   </div>
  </>
 )
}

export default Register