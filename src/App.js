import './App.css';

import React from 'react';
import axios from 'axios';

const cameraSelectionReducer = (state, action) => {
  switch (action.type) {
    case 'REQUEST_IN_PROGRESS': {
      return {
        ...state,
        isLoading: true,
      }
    }
    case 'REQUEST_CAMERAS_SUCCESS': {
      return {
        ...state,
        isLoading: false,
        cameras: action.payload,
      }
    }
    default: {
      return state
    }
  }
}

const cameraOptionsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CAMERA_TYPE': {
      return {
        ...state,
        camera_type: action.payload,
      }
    }
    case 'SET_OUTFIT_TYPE': {
      return {
        ...state,
        outfit_type: action.payload,
      }
    }
    case 'SET_RESOLUTION': {
      return {
        ...state,
        resolution: action.payload,
      }
    }
    case 'SET_SETUP': {
      return {
        ...state,
        comeWithSetup: action.payload,
      }
    }
    case 'SET_ALL': {
      return {
        ...state,
        ...action.payload,
      }
    }
    default: {
      return state
    }
  }
}

function App() {
  const [cameraSelection, dispatchCameraSelection] = React.useReducer(cameraSelectionReducer, {
    cameras: [], isLoading: false
  })
  const [cameraOutfitTypes, setCameraOutfitTypes] = React.useState([]);
  const [cameraTypes, setCameraTypes] = React.useState([]);
  const [cameraResolutions, setCameraResolutions] = React.useState([]);
  const [cameraOptions, dispatchCameraOptions] = React.useReducer(cameraOptionsReducer,
    { camera_type: null, outfit_type: null, resolution: null, comeWithSetup: true }
  );

  const cameraTypeRef = React.useRef(null);
  const outfitTypeRef = React.useRef(null);
  const resolutionRef = React.useRef(null);
  const withSetupRef = React.useRef(null);

  const handleFetchCameraTypes = React.useCallback(() => {
    const response = async () => {
      let data;
      const res = await axios.get('http://localhost:3001/camera/getCameraTypes');
      data = await res.data;
      setCameraTypes(data);
    }
    response();
  }, [cameraOptions])

  const handleFetchCameras = React.useCallback(() => {
    dispatchCameraSelection({ type: 'REQUEST_IN_PROGRESS' });
    const response = async () => {
      const res = await axios.get(`http://localhost:3001/camera${
        (cameraOptions.camera_type && "?camera_type=" + cameraOptions.camera_type + "&") +
        (cameraOptions.outfit_type && "outfit_type=" + cameraOptions.outfit_type + "&") +
        (cameraOptions.resolution && "resolution=" + cameraOptions.resolution + "&")
      }`);
      const data = await res.data;
      dispatchCameraSelection({ type: 'REQUEST_CAMERAS_SUCCESS', payload: data });
    }
    response();
  }, [cameraOptions])

  const handleFetchOutfitType = React.useCallback(() => {
    if (!cameraOptions.camera_type) return;
    dispatchCameraOptions({ type: 'REQUEST_IN_PROGRESS' })

    const response = async () => {
      const res = await axios.get(`http://localhost:3001/camera/getOutfitTypes${
        (cameraOptions.camera_type && "?camera_type=" + cameraOptions.camera_type + "&")
      }`);
      const data = await res.data;
      setCameraOutfitTypes(data);
    }
    response();
  }, [cameraOptions])

  const handleFetchResolution = React.useCallback(() => {
    const response = async () => {
      let data;
      const res = await axios.get(`http://localhost:3001/camera/getResolutions?camera_type=${cameraOptions.camera_type}&outfit_type=${cameraOptions.outfit_type}`);
      data = await res.data;
      setCameraResolutions(data);
    }
    response();
  }, [cameraOptions])

  const handleSetResolution = (e) => {
    if (isNaN(e.target.value))
    {
      dispatchCameraOptions({ type: 'SET_RESOLUTION', payload: null});
      return;
    }
    dispatchCameraOptions({ type: 'SET_RESOLUTION', payload: parseInt(e.target.value)});
  }

  const handleSetCameraOptions = () => {
    dispatchCameraOptions({ type: 'SET_ALL', payload: {
      camera_type: cameraTypeRef.current.value.toLowerCase() === "válassz egyet" ? null : cameraTypeRef.current.value,
      outfit_type: outfitTypeRef.current.value.toLowerCase() === "válassz egyet" ? null : outfitTypeRef.current.value,
      comeWithSetup: withSetupRef.current.value.toLowerCase() === "igen" ? true : false,
    } })
  }

  React.useEffect(() => {
    handleFetchCameraTypes();
    handleFetchOutfitType();
    handleFetchResolution();
  }, [cameraOptions])

  return (
    <div className="App">
      <label>Milyen Típusú kamerát keresel? </label>
      <select ref={cameraTypeRef} value={cameraOptions.camera_type} onChange={handleSetCameraOptions}>
        <option>Válassz Egyet</option>
        {
          cameraTypes.map((item, idx) => {
            return <option key={idx} >{item.camera_type}</option>
          })
        }
      </select>
      <hr/>
      <label>Milyen kialakítású legyen? </label>
      <select ref={outfitTypeRef} value={cameraOptions.outfit_type} onChange={handleSetCameraOptions}>
        <option>Válassz Egyet</option>
        {
          cameraOutfitTypes.map((item, idx) => {
            return <option key={idx} >{item.outfit_type}</option>
          })
        }
      </select>
      <hr/>
      <label>Hány mp legyen a kamera? </label>
      <select ref={resolutionRef} value={cameraOptions.resolution} onChange={(e) => handleSetResolution(e)} >
        <option>Válassz Egyet</option>
        {cameraResolutions.map((item, idx) => {
          return <option key={idx} >{item.resolution}</option>
        })}
      </select>
      <hr/>
      <label>Beüzemeléssel szeretnéd rendelni? </label>
      <select ref={withSetupRef} value={cameraOptions.comeWithSetup === true ? "Igen" : "Nem"} onChange={handleSetCameraOptions} >
        <option>Igen</option>
        <option>Nem</option>
      </select>
      <hr/>
      {cameraOptions.camera_type && cameraOptions.outfit_type && cameraOptions.resolution &&
        <button onClick={handleFetchCameras} >Kérem</button>}
      <hr/>
      <div>
        {cameraSelection.cameras.length !== 0 && <strong>{cameraSelection.cameras[0].name}</strong>}
      </div>
    </div>
  );
}

export default App;
