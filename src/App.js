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
  const [cameraOptions, dispatchCameraOptions] = React.useReducer(cameraOptionsReducer, { camera_type: null, outfit_type: null, resolution: null })

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
    dispatchCameraOptions({ type: 'REQUEST_IN_PROGRESS' })

    const response = async () => {
      const res = await axios.get(`http://localhost:3001/camera${
        (cameraOptions.camera_type && "?camera_type=" + cameraOptions.camera_type + "&") +
        (cameraOptions.outfit_type && "?outfit_type=" + cameraOptions.outfit_type + "&") +
        (cameraOptions.resolution && "?resolution=" + cameraOptions.resolution + "&")
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

  const handleSetCameraType = (e) => {
    dispatchCameraOptions({ type: 'SET_CAMERA_TYPE', payload: e.target.value })
  }

  const handleSetOutfitType = (e) => {
    dispatchCameraOptions({ type: 'SET_OUTFIT_TYPE', payload: e.target.value })
  }

  React.useEffect(() => {
    handleFetchCameraTypes();
    handleFetchOutfitType();
    handleFetchResolution();
  }, [cameraOptions])

  return (
    <div className="App">
      <label>Camera Type: </label>
      <select onClick={(e) => {handleSetCameraType(e);}}>
        <option>Select One</option>
        <ItemOptions items={cameraSelection.cameras} />
        {
          cameraTypes.map((item, idx) => {
            return <option key={idx} >{item.camera_type}</option>
          })
        }
      </select>
      <hr/>
      <label>Outfit Type: </label>
      <select onClick={(e) => {handleSetOutfitType(e)}}>
        <option>Select One</option>
        {
          cameraOutfitTypes.map((item, idx) => {
            return <option key={idx} >{item.outfit_type}</option>
          })
        }
      </select>
      <hr/>
      <label>Resolution (MP): </label>
      <select>
        <option>Select one</option>
        {cameraResolutions.map((item, idx) => {
          return <option key={idx} >{item.resolution}</option>
        })}
      </select>
    </div>
  );
}

const ItemOptions = ({ items }) => {
  return (
      items.map((item, idx) => {
        return <option key={idx} >{item.camera_type}</option>
      })
  )
}

export default App;
