import { useState } from 'react'

const EndpointDisplay = (props) => {
  const [copyText, setCopyText] = useState('(Copy)');
	
  const copyUrl = (event) => {
    navigator.clipboard.writeText(props.endpoint);
	setCopyText("Copied!")
  }	  
  
  return (
    <div>
	<p>Your URL is: {props.endpoint} <span class="copytext" onClick={copyUrl}>{copyText}</span></p>
	</div>
  )
}

const MainScreen = () => {
 const [endpoint, setEndpoint] = useState('');

 const generateURL = async (event) => {
    event.preventDefault();
    let result = await fetch(
        'http://localhost:4001/createuuid', {
            method: "get",
        })
        result = await result.text();
        if (result) {
	        setEndpoint(result);
        }
  };  
  
  let url = '';
  if (endpoint) {
    url = <EndpointDisplay endpoint={endpoint} /> 
  }

  return (
    <div>
	  <h3>Questbin</h3>
	  <form onSubmit={generateURL}>
	  <button type="submit">Get endpoint URL</button>
	  </form>
	  <p>{url}</p>
    </div>
  );
}

export default MainScreen;