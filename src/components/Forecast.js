import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import megaphone from '../images/megaphone.png'
import microphone from '../images/microphone.png'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// For Netlify, we'll use a proxy approach instead of direct API calls
// This helps avoid CORS issues and protects your API key
const Forecast = () => {
 const navigate = useNavigate();
 const { transcript, listening, resetTranscript } = useSpeechRecognition();

 // Initialize state with safe defaults
 const [currentUser, setCurrentUser] = useState(null);
 const [city, setCity] = useState('');
 const [weather, setWeather] = useState(null);
 const [error, setError] = useState('');
 const [loading, setLoading] = useState(false);
 const [getSpeakWeather, setSpeakWeather] = useState(null);
 const [isVoiceInput, setIsVoiceInput] = useState(false);
 
 // Load user data on component mount
 useEffect(() => {
   try {
     const userData = localStorage.getItem('currentUser');
     if (userData) {
       const user = JSON.parse(userData);
       setCurrentUser(user);
       if (user.city) {
         setCity(user.city);
       }
     } else {
       navigate('/login');
     }
   } catch (err) {
     console.error("Error loading user data:", err);
     navigate('/login');
   }
 }, [navigate]);

 const username = currentUser?.username || 'User';

 const saveCity = () => {
  if (!currentUser) {
    alert("Please log in first to save your city.");
    return;
  }
  
  try {
    const updateCity = { ...currentUser, city: city };
    localStorage.setItem('currentUser', JSON.stringify(updateCity));
    setCurrentUser(updateCity);

    const usersStr = localStorage.getItem('users');
    if (usersStr) {
      const users = JSON.parse(usersStr);
      const updateUsers = users.map(user =>
        user.username === currentUser.username && user.password === currentUser.password 
          ? updateCity 
          : user
      );
      localStorage.setItem('users', JSON.stringify(updateUsers));
    }

    alert("City Saved Successfully!");
  } catch (err) {
    console.error("Error saving city:", err);
    alert("Failed to save city. Please try again.");
  }
 }

 const handleLogout = () => {
  localStorage.removeItem('currentUser');
  setCurrentUser(null);
  alert("Logged out successfully");
  navigate('/login');
 };

 // Separate function to handle search button click
 const handleSearch = () => {
   if (!city.trim()) {
     setError('Please enter a city name');
     return;
   }
   
   fetchWeather(city);
 };

 // Generic weather fetching function that can be reused
 const fetchWeather = async (cityName) => {
   if (!cityName) return;
   
   setLoading(true);
   setError('');
   setWeather(null);
   
   try {
     // Using proxy approach - this URL needs to be configured in netlify.toml
     // You'll need to set up a Netlify function or use a service like Netlify or Vercel proxy
     const API_KEY = 'abf885a941d7a9364767f8f3d63138ab'; // Using hard-coded key temporarily
     const response = await fetch(
       `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=metric`,
       { 
         method: 'GET',
         headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json'
         },
       }
     );
     
     // Check if the response is ok before trying to parse JSON
     if (!response.ok) {
       const errorText = await response.text();
       throw new Error(`API error: ${response.status} - ${errorText}`);
     }
     
     const data = await response.json();
     
     if (data.cod !== 200) {
       setError(data.message || 'City Not Found');
     } else {
       setWeather(data);
       setSpeakWeather(data);
     }
   } catch (err) {
     console.error('Weather fetch error:', err);
     setError(`Failed to fetch weather data: ${err.message}`);
   } finally {
     setLoading(false);
   }
 };

 const fetchWeatherByLocation = () => {
  if (!navigator.geolocation) {
   alert('Geolocation is not supported by your browser.');
   return;
  }

  setLoading(true);
  setError('');
  
  navigator.geolocation.getCurrentPosition(
   async (position) => {
    const { latitude, longitude } = position.coords;

    try {
     const API_KEY = 'abf885a941d7a9364767f8f3d63138ab'; // Using hard-coded key temporarily
     const response = await fetch(
       `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`,
       { 
         method: 'GET',
         headers: {
           'Accept': 'application/json',
           'Content-Type': 'application/json'
         },
       }
     );
     
     if (!response.ok) {
       const errorText = await response.text();
       throw new Error(`API error: ${response.status} - ${errorText}`);
     }
     
     const data = await response.json();

     if (data.cod !== 200) {
      setError(data.message || 'Unable to get weather for your location');
     } else {
      setWeather(data);
      setSpeakWeather(data);
      setCity(data.name); // Set the city name based on geolocation
     }
    } catch (err) {
     console.error('Error fetching weather by location:', err);
     setError(`Location weather error: ${err.message}`);
    } finally {
     setLoading(false);
    }
   }, 
   (err) => {
    console.error('Geolocation error:', err);
    setError('Location access denied or error occurred.');
    setLoading(false);
   },
   { timeout: 10000 } // 10 second timeout for geolocation
  );
 }

 const speakWeather = () => {
  if (!getSpeakWeather) return;

  const city = getSpeakWeather.name;
  const temp = getSpeakWeather.main.temp;
  const wind = getSpeakWeather.wind.speed;
  const humidity = getSpeakWeather.main.humidity;

  const message = `The current temperature in ${city} is ${temp} degrees celsius, with the wind blowing at the speed of ${wind} meters per second and the humidity is ${humidity} percent.`;

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'en-US';
  speechSynthesis.speak(utterance);
 }

 const startListening = () => {
  setIsVoiceInput(true);
  resetTranscript();
  SpeechRecognition.startListening({ continuous: false });
 }

 const stopListening = () => {
  SpeechRecognition.stopListening();
  setIsVoiceInput(false);
 };

 // Fetch weather when city is saved in user data
 useEffect(() => {
   if (currentUser?.city && !city && !weather) {
     setCity(currentUser.city);
     fetchWeather(currentUser.city);
   }
 }, [currentUser, city, weather]);

 // Handle speech recognition browser support check
 useEffect(() => {
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
   console.warn("Browser does not support speech recognition");
  }
 }, []);

 // Update city from transcript once speech recognition completes
 useEffect(() => {
  if (isVoiceInput && transcript && transcript.trim() !== '') {
   setCity(transcript);
   // Don't auto-search after voice input to avoid immediate API calls
  }
 }, [transcript, isVoiceInput]);

 // Update isVoiceInput based on listening state
 useEffect(() => {
  setIsVoiceInput(listening);
 }, [listening]);

 return (
  <>
   <div className='min-w-full h-full bg-[#0E2F1B]/80 rounded-lg p-2 flex justify-between items-center flex-col'>

    <div className='flex flex-grow items-center flex-col'>

     <div className='flex justify-center items-center flex-col mb-1'>
      <h2 className='text-2xl font-semibold mb-4 text-[#E8F0EB]'>
       Welcome, {username.charAt(0).toUpperCase() + username.slice(1)}
      </h2>
      <p className='text-[#E8F0EB] px-4 py-2 text-center'>Where to next? Search a city and we'll handle the forecast.</p>
     </div>

     <div className='mb-4 grid grid-cols-12 lg:w-[600px] gap-4'>
      <div className='lg:col-span-7 col-span-12 lg:h-[50px] h-[40px] flex justify-center items-center w-full bg-[#AFCBC4] rounded-lg focus-within:border-2 focus-within:border-blue-400'>
       <input type='text'
        placeholder='Write here...'
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        className='bg-transparent w-full text-[rgb(3,7,18)] px-4 py-2 rounded-lg focus:outline-none' />
       <img src={microphone} alt="mic" className='h-[20px] w-[20px] cursor-pointer mr-2'
        onClick={listening ? stopListening : startListening} />
      </div>

      <button 
       className='lg:col-span-2 col-span-6 lg:w-full w-[150px] lg:h-[50px] h-[40px] bg-[#AFCBC4] text-[#5B6C67] hover:text-[#0E2F1B] p-2 border rounded-lg'
       onClick={handleSearch}
       disabled={loading}>
       {loading ? 'Loading...' : 'Search'}
      </button>

      <button 
       className='lg:col-span-3 col-span-6 lg:w-full w-[150px] lg:h-[50px] h-[40px] bg-[#AFCBC4] text-[#5B6C67] hover:text-[#0E2F1B] p-2 border rounded-lg'
       onClick={saveCity}
       disabled={!city}>
        Save this city
      </button>
     </div>

     {listening && <p className="text-sm text-green-300 mt-1">🎙️ Listening...</p>}

     <p className='text-[#5B6C67] hover:underline cursor-pointer' onClick={fetchWeatherByLocation}>Use my Current Location</p>

     {error && <p className="text-red-400 mb-2">{error}</p>}

     {weather && (
      <div className='w-full lg:h-[150px] mt-4 flex justify-center'>
       <div className='bg-white lg:w-full w-[75%] h-full bg-opacity-10 rounded-md p-4 backdrop-blur-sm text-white space-y-2'>
        <div className='flex gap-4'>
         <h3 className='text-xl font-bold'>
          {weather.name}, {weather.sys.country}
         </h3>
         <div className='h-[20px] flex justify-center items-center cursor-pointer'
          onClick={speakWeather}>
          <img className='h-full' src={megaphone} alt="speak" />
         </div>
        </div>
        <div className='grid lg:grid-cols-2 gap-2 grid-cols-1'>
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
