import { useState, useEffect } from 'react'
import JsonView from 'react18-json-view'
import 'react18-json-view/src/style.css'
const baseURL = "http://localhost:3001/"

const NewEndpoint = (props) => {
  const [copyText, setCopyText] = useState('Copy');

  const copyUrl = (event) => {
    navigator.clipboard.writeText(props.endpoint);
    setCopyText("Copied!")
  }

  return (
    <div>
      <p>Your endpoint URL:</p>
      <p className="endpoint" >{props.endpoint} <span className="copytext" onClick={copyUrl}>({copyText})</span></p>
    </div>
  )
}

const RequestList = (props) => {
  const [reqs, setReqs] = useState([]);
  const [style, setStyle] = useState('reqs');

  useEffect(() => {
    async function fetchRequests() {
      let result = await fetch(
        baseURL + 'requests/' + props.endpoint, {
        method: "get",
      });
      result = await result.text();
      try {
        let json = JSON.parse(result);
        setReqs(json);
        setStyle('reqs');
      } catch(err) {
        setStyle('');
        setReqs([]);
      }
    }
    fetchRequests();
  }, [props.endpoint]);

  let output = '';
  if (reqs.length === 0) {
    output = "No requests yet..."
  }
  else {
    output = reqs.map(req => (
      <JsonView key={req} src={req} />
    ));
  }

  return (
    <div>
      <hr />
      <h4>Requests:</h4>
      <p className={style} >{output}</p>
    </div>
  )
}

const EndpointGenerator = (props) => {
  const [newEndpoint, setNewEndpoint] = useState('');
  const [buttonText, setButtonText] = useState('Create new endpoint URL');

  const generateURL = async (event) => {
    event.preventDefault();
    let result = await fetch(
      baseURL + 'createuuid', {
      method: "get",
    })
    result = await result.text();
    if (result) {
      setNewEndpoint(result);
      setButtonText('Endpoint generated!');
      props.updateEndpoints(!props.changed);
      }
  };

  let url = '';
  if (newEndpoint) {
    url = <NewEndpoint endpoint={newEndpoint} />
  }

  return (
  <div>
    <form onSubmit={generateURL}>
      <button type="submit">{buttonText}</button>
    </form>
    <p>{url}</p>
  </div>
  );
}

const EndpointList = (props) => {
  const [endpoints, setEndpoints] = useState([]);
  const [chosenEndpoint, setChosenEndpoint] = useState('');

  useEffect(() => {
    async function fetchEndpoints() {
      fetch(baseURL + 'uuids')
         .then(res => res.json())
         .then(data => setEndpoints(data));
    };
    fetchEndpoints();
  }, [props.changed]);
  
  const getUuid = (event) => {
    event.preventDefault();
    props.selectEndpoint(chosenEndpoint);
  }
  
  const chooseUuid = (event) => {
    setChosenEndpoint(event.target.value);
  }
  
  return (
    <div>
      <hr />
      <h4>View requests</h4>
      <form onSubmit={getUuid}>
        <select value={chosenEndpoint} onChange={chooseUuid}>
        <option value="">Choose an endpoint:</option>
        {endpoints.map(endpoint => (
          <option key={endpoint.uuid} value={endpoint.uuid}> {endpoint.uuid}</option>
        ))}
        </select>
        <p><button type="submit">View</button></p>
      </form>
    </div>
  );
}

const MainScreen = () => {
  const [endpointsChanged, setEndpointsChanged] = useState(false);
  const [chosenEndpoint, setChosenEndpoint] = useState('');
  
  const selectEndpoint = (selected) => {
    setChosenEndpoint(selected);
  };
  
  let reqs = '';
  if (chosenEndpoint) {
    reqs = <RequestList endpoint={chosenEndpoint} />
  }

  return (
    <div>
      <h3>Questbin</h3>
      <p>Generate an endpoint to collect HTTP requests.</p>
      <hr />
      <EndpointGenerator changed={endpointsChanged} updateEndpoints={setEndpointsChanged} />
      <EndpointList selectEndpoint={selectEndpoint} changed={endpointsChanged} />
      {reqs}
    </div>
  );
}

export default MainScreen;