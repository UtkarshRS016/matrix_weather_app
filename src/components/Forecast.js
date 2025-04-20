import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom';
import megaphone from '../images/megaphone.png'
import microphone from '../images/microphone.png'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const API_KEY = 'abf885a941d7a9364767f8f3d63138ab';

const Forecast = () => {

 const navigate = useNavigate();
 const currentUser = JSON.parse(localStorage.getItem('currentUser'));
 const { transcript, listening, resetTranscript } = useSpeechRecognition();

 const [city, setCity] = useState(currentUser?.city || '');
 const [weather, setWeather] = useState(null);
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [getSpeakWeather, setSpeakWeather] = useState(null)
 const [isVoiceInput, setIsVoiceInput] = useState(false);
 
 const username = currentUser?.username || 'User';

 const saveCity = () => {
  const updateCity = { ...currentUser, city: city };
  localStorage.setItem('currentUser', JSON.stringify(updateCity));

  const users = JSON.parse(localStorage.getItem('users'));
  const updateUsers = users.map(user =>
   user.username === currentUser.username && user.password === currentUser.password ? updateCity : user);
  localStorage.setItem('users', JSON.stringify(updateUsers));

  alert("City Saved Successfully !");

 }

 const handleLogout = () => {
  localStorage.removeItem('currentUser');
  alert("Logged out successfully");
  navigate('/login');
 };

 const fetchWeatherByCity = useCallback(async () => {
  if (!city)
   return
  try {
   setLoading(true);
   setError('');
   setWeather(null);

   const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
   )

   const data = await res.json();

   console.log(data);

   if (data.cod !== 200) {
    setError(data.message || 'City Not Found')
   }
   else {
    setWeather(data);
    setSpeakWeather(data)
   }
  }
  catch (err) {
   setError('Something went Wrong. Try again.')
   console.log('error fetching weather ', err);
  }
  finally {
   setLoading(false);
  }
 },[city])

 const fetchWeatherByLocation = () => {
  if (!navigator.geolocation) {
   alert('Geolocation is not supported by your browser.')
   return
  }

  navigator.geolocation.getCurrentPosition(
   async (position) => {
    const { latitude, longitude } = position.coords;

    try {
     setLoading(true);
     setError('');
     setWeather(null);

     const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
     )

     const data = await res.json();

     if (data.cod !== 200) {
      setError(data.message || 'Unable to get weather for your location');
     }
     else {
      setWeather(data);
      setSpeakWeather(data);
     }

    }
    catch (err) {
     setError('Error fecthing location. Try again.')
     console.log('error fetching weather ', err);
    }
    finally {
     setLoading(false);
    }

   }, () => {
    alert('Location access denied');
   })

  setCity('');
  setWeather(null);
  setSpeakWeather(null)

 }

 const speakWeather = () => {
  if (!getSpeakWeather)
   return

  const city = getSpeakWeather.name;
  const temp = getSpeakWeather.main.temp;
  const wind = getSpeakWeather.wind.speed;
  const humidity = getSpeakWeather.main.humidity;

  const message = `The current temperature in ${city} is ${temp} degrees celsius, with the wind blowing at the speed of ${wind}meters per second and the humidity is ${humidity}percent.`

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);

 }


 const startListening = () => {
  setIsVoiceInput(true);
  resetTranscript();
  SpeechRecognition.startListening({ continuous: false });

  console.log(transcript);
 }

 const stopListening = () => {
  SpeechRecognition.stopListening();
  setIsVoiceInput(false);
 };


 useEffect(() => {
  if (!currentUser) {
   navigate('/login');
  }
  else {
   fetchWeatherByCity();
  }
 }, [currentUser, navigate, fetchWeatherByCity]);


 useEffect(() => {
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
   alert("Browser does not support speech recognition");
  }

 }, []);

 useEffect(() => {
  if (isVoiceInput && transcript) {
   setCity(transcript); 
  }
 }, [transcript, isVoiceInput]);

 useEffect(() => {
  console.log("Transcript:", transcript);
 }, [transcript]);

 useEffect(() => {
  setIsVoiceInput(listening);
 }, [listening])


 return (
  <>
   <div className='min-w-full h-full bg-[#0E2F1B]/80 rounded-lg p-2 flex justify-between items-center flex-col '>

    <div className='flex flex-grow items-center flex-col'>

     <div className='flex justify-center items-center flex-col mb-1'>
      <h2 className='text-2xl font-semibold mb-4 text-[#E8F0EB]'>
       Welcome, {username.charAt(0).toUpperCase() + username.slice(1)}.
      </h2>
      <p className='text-[#E8F0EB] px-4 py-2 text-center'>Where to next? Search a city and we’ll handle the forecast.</p>
     </div>

     <div className='mb-4 grid grid-cols-12 lg:w-[600px] gap-4'>
      <div className='lg:col-span-7 col-span-12 lg:h-[50px] h-[40px] flex justify-center items-center w-full bg-[#AFCBC4] rounded-lg focus-within:border-2 focus-within:border-blue-400'>
       <input type='text'
        placeholder='Write here...'
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className='bg-transparent w-full text-[rgb(3,7,18)] px-4 py-2  rounded-lg focus:outline-none' />
       <img src={microphone} alt="mic" className='h-[20px] w-[20px] cursor-pointer mr-2'
        onClick={listening ? stopListening : startListening}></img>
      </div>

      <button className='lg:col-span-2 col-span-6 lg:w-full w-[150px] lg:h-[50px] h-[40px] bg-[#AFCBC4] text-[#5B6C67] hover:text-[#0E2F1B] p-2 border rounded-lg'
       onClick={fetchWeatherByCity}>
       {loading ? 'Loading...' : 'Search'}
      </button>

      <button className='lg:col-span-3 col-span-6 lg:w-full w-[150px] lg:h-[50px] h-[40px] bg-[#AFCBC4] text-[#5B6C67] hover:text-[#0E2F1B] p-2 border rounded-lg '
       onClick={saveCity}>Save this city
      </button>

     </div>

     {listening && <p className="text-sm text-green-300 mt-1">🎙️ Listening...</p>}

     <p className='text-[#5B6C67] hover:underline cursor-pointer' onClick={fetchWeatherByLocation}>Use my Current Location</p>

     {error && <p className="text-red-400 mb-2">{error}</p>}

     {weather && (
      <div className='w-full lg:h-[150px]  mt-4 flex justify-center'>
       <div className='bg-white lg:w-full w-[75%] h-full bg-opacity-10 rounded-md p-4 backdrop-blur-sm
      text-white space-y-2'>
        <div className='flex gap-4'>
         <h3 className='text-xl font-bold'>
          {weather.name}, {weather.sys.country}
         </h3>
         <div className='h-[20px] flex justify-center items-center cursor-pointer'
          onClick={speakWeather}>
          <img className='h-full' src={megaphone} alt=" "></img>
         </div>
        </div>
        <div className='grid lg:grid-cols-2 gap-2 grid-cols-1 '>
         <p>🌡 Temp: {weather.main.temp} °C</p>
         <p>🌡 Feels Like: {weather.main.feels_like} °C</p>
         <p>🌥 Weather: {weather.weather[0].description}</p>
         <p>💨 Wind: {weather.wind.speed} m/s</p>
         <p>💧 Humidity: {weather.main.humidity}%</p>
        </div>
       </div>
      </div>
     )}

    </div>

    <button
     onClick={handleLogout}
     className='bg-[#AFCBC4] text-[#5B6C67] hover:text-[#0E2F1B] p-2 border rounded-lg mb-2'>
     Log out
    </button>

   </div>
  </>
 )
}

export default Forecast
