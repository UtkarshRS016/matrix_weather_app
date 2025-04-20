import { Route, BrowserRouter, Routes } from 'react-router-dom';
// import Home from './components/Home';
import forest from './images/forest_pic.jpeg'
import Register from './components/Register';
import LogIn from './components/LogIn';
import Forecast from './components/Forecast';

function App() {
 return (
  <>
   <BrowserRouter>
    {/* <div className='w-screen h-screen bg-[#60B5FF] text-white p-[35px]'> */}
    <div className='relative h-screen w-screen overflow-hidden p-[35px] flex justify-center'>
     <div className='absolute top-[50px] left-1/2 transform -translate-x-1/2 z-20 text-[#0E2F1B]/60 lg:text-[60px] md:text-[40px] text-[30px] font-bold font-poppins'>
      Weatherly
     </div>
     <img className="absolute inset-0 w-full h-full object-cover blur-sm"
      src={forest} alt="night sky" />
     <div className='relative z-10 w-full h-full'>

      <div className='w-full h-full border-[10px] border-[#E8F0EB] 
      rounded-[20px] 
      flex justify-center items-center 
      lg:py-[100px] lg:px-[200px] 
      md:py-[60px] md:px-[100px]
      py-[50px] px-[20px] backdrop-blur-md'>
       <img className="absolute inset-0 w-full h-full object-cover blur-sm" src={forest} alt="night sky" />

       <div className='z-10 w-full h-full flex justify-center items-center'>
        <Routes>
         <Route path='/' element={<Register />} />
         <Route path='/login' element={<LogIn />} />
         <Route path='/forecast' element={<Forecast />} />
        </Routes>
       </div>

      </div>

     </div>
    </div>
   </BrowserRouter >
  </>
 );
}

export default App;
