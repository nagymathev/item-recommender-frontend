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
    case 'REQUEST_CAMERA_TYPES_SUCCESS': {
      return {
        ...state,
        isLoading: false,
        camera_types: action.payload,
      }
    }
    case 'REQUEST_OUTFIT_TYPES_SUCCESS': {
      return {
        ...state,
        isLoading: false,
        outfit_types: action.payload,
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
    cameras: [], camera_types: [], outfit_types: [], isLoading: false
  })
  const [cameraOptions, dispatchCameraOptions] = React.useReducer(cameraOptionsReducer, { camera_type: null, outfit_type: null, resolution: null })

  const handleFetchCameraTypes = React.useCallback(() => {
    dispatchCameraSelection({ type: 'REQUEST_IN_PROGRESS' })
    console.log("Fetching")

    const response = async () => {
      let data;
      try {
        const res = await axios.get('http://localhost:3001/camera_type');
        data = await res.data;
      }
      catch {
        throw new Error('Fetch fail')
      }
      finally {
        if (!data) throw new Error('Undefined data')
        dispatchCameraSelection({ type: 'REQUEST_CAMERA_TYPES_SUCCESS', payload: data });
      }
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
      const res = await axios.get(`http://localhost:3001/outfit_type${
        (cameraOptions.camera_type && "?camera_type=" + cameraOptions.camera_type + "&")
      }`);
      const data = await res.data;
      dispatchCameraSelection({ type: 'REQUEST_OUTFIT_TYPES_SUCCESS', payload: data });
    }
    response();
  }, [cameraOptions])

  const handleSetCameraType = (e) => {
    dispatchCameraOptions({ type: 'SET_CAMERA_TYPE', payload: e.target.selectedIndex })
  }

  const handleSetOutfitType = (e) => {
    console.log(e);
  }

  React.useEffect(() => {
    handleFetchCameraTypes();
  }, [])

  return (
    <div className="App">
      <label>Camera Type: </label>
      <select onClick={(e) => {handleSetCameraType(e); handleFetchOutfitType()}}>
        <option>Select One</option>
        <ItemOptions items={cameraSelection.camera_types} />
      </select>
      <hr/>
      <label>Outfit Type: </label>
      <select onClick={(e) => {handleSetOutfitType(e)}}>
        <option>Select One</option>
        <ItemOptions items={cameraSelection.outfit_types} />
      </select>
      <hr/>
      <label>Resolution (MP): </label>
      <select onClick={handleFetchCameras}>
        <option>Select one</option>
        {cameraSelection.cameras.map(cam => {
          return <option key={cam.id} id={cam.id} >{cam.resolution}</option>
        })}
      </select>
    </div>
  );
}

const ItemOptions = ({ items }) => {
  return (
      items.map(item => {
        return <option key={item.id} id={item.id} >{item.name}</option>
      })
  )
}

export default App;
