import { useState, useEffect } from 'react'
import JsonView from 'react18-json-view'
import 'react18-json-view/src/style.css'
import { io } from "socket.io-client";

const socket = io("ws://localhost:3002");

const baseURL = "/"

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
  const COLLAPSE_LENGTH = 200; // To prevent non-HTTP responses (e.g. test data) from being auto-collapsed
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
		console.log(json);
        setReqs(json);
        setStyle('reqs');
      } catch(err) {
        setStyle('');
        setReqs([]);
      }
    }
    fetchRequests();
  }, [props.endpointRefresh]);

  let output = '';
  if (reqs.length === 0) {
    output = "No requests yet..."
  }
  else {
    output = reqs.map(req => {
	  let method = (req.request_body.method) ? req.request_body.method : '';
	  let src = (req.request_body.body) ? req.request_body.body : req.request_body;
	  let collapseLength = (req.request_body.method) ? 0 : COLLAPSE_LENGTH;
      return (
	  <div className={style} >{method} <JsonView key={req.id} src={src} collapseObjectsAfterLength={collapseLength} /></div>
	  );
    });
  }

  console.log(reqs);

  return (
    <div>
      <hr />
      <h4>Requests:</h4>
      {output}
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
  const [endpointRefresh, setEndpointRefresh] = useState(false);
  
  const selectEndpoint = (selected) => {
    setChosenEndpoint(selected);
	setEndpointRefresh(!endpointRefresh);
  };
  
  let reqs = '';
  if (chosenEndpoint) {
    reqs = <RequestList endpoint={chosenEndpoint} endpointRefresh={endpointRefresh} />
  }

  socket.on("new", (uuid) => {
    if (uuid === chosenEndpoint) {
	  setEndpointRefresh(!endpointRefresh);
	}
  });

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