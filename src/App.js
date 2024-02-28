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
    case 'REQUEST_MOUNT_SUCCESS': {
      return {
        ...state,
        isLoading: false,
        mounts: action.payload,
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
    case 'SET_NUMOFCAMERAS': {
      return {
        ...state,
        numberOfCameras: action.payload,
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
    cameras: [], mounts: [], isLoading: false
  })
  const [cameraOutfitTypes, setCameraOutfitTypes] = React.useState([]);
  const [cameraTypes, setCameraTypes] = React.useState([]);
  const [cameraResolutions, setCameraResolutions] = React.useState([]);
  const [cameraOptions, dispatchCameraOptions] = React.useReducer(cameraOptionsReducer,
    { camera_type: null, outfit_type: null, resolution: null, comeWithSetup: true, numberOfCameras: 1 }
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

  const handleFetchMount = React.useCallback(() => {
    dispatchCameraSelection({ type: 'REQUEST_IN_PROGRESS' });
    const response = async () => {
      const res = await axios.get(`http://localhost:3001/camera_mount?numofcams=${cameraOptions.numberOfCameras}`);
      const data = await res.data;
      dispatchCameraSelection({ type: 'REQUEST_MOUNT_SUCCESS', payload: data})
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

  const handleSetNumberOfCameras = (e) => {
    dispatchCameraOptions({ type: 'SET_NUMOFCAMERAS', payload: parseInt(e.target.value)});
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
    if (cameraOptions.camera_type && cameraOptions.outfit_type && cameraOptions.resolution)
    {
      handleFetchCameras();
      handleFetchMount();
    }
  }, [cameraOptions])

  return (
    <div className="App">
      <div className='calculator outline shadow'>
        <label>Milyen Típusú kamerát keresel? </label>
        <select ref={cameraTypeRef} value={cameraOptions.camera_type} onChange={handleSetCameraOptions}>
          <option>Válassz Egyet</option>
          {
            cameraTypes.map((item, idx) => {
              return <option key={idx} >{item.camera_type}</option>
            })
          }
        </select>
        <br/>
        <label>Milyen kialakítású legyen? </label>
        <select ref={outfitTypeRef} value={cameraOptions.outfit_type} onChange={handleSetCameraOptions}>
          <option>Válassz Egyet</option>
          {
            cameraOutfitTypes.map((item, idx) => {
              return <option key={idx} >{item.outfit_type}</option>
            })
          }
        </select>
        <br/>
        <label>Hány mp legyen a kamera? </label>
        <select ref={resolutionRef} value={cameraOptions.resolution} onChange={(e) => handleSetResolution(e)} >
          <option>Válassz Egyet</option>
          {cameraResolutions.map((item, idx) => {
            return <option key={idx} >{item.resolution}</option>
          })}
        </select>
        <br/>
        <label>Beüzemeléssel szeretnéd rendelni? </label>
        <select ref={withSetupRef} value={cameraOptions.comeWithSetup === true ? "Igen" : "Nem"} onChange={handleSetCameraOptions} >
          <option>Igen</option>
          <option>Nem</option>
        </select>
        <br/>
        <label>Mennyiség? </label>
        <input type='number' value={cameraOptions.numberOfCameras} min={1} max={9} onChange={handleSetNumberOfCameras} />

        <div>
        {cameraSelection.cameras.length !== 0 && cameraSelection.cameras.length !== 0 &&
          <ResultsMenu
            camera={cameraSelection.cameras[0]}
            mount={cameraSelection.mounts[0]}
            numOfCams={cameraOptions.numberOfCameras}
            comesWithSetup={cameraOptions.comeWithSetup}
            isLoading={cameraSelection.isLoading}
          />}
        </div>
      </div>

      <article className='outline shadow box'>
        <div>
          <p><strong>IP Kamera: </strong> Lorem, ipsum dolor sit amet consectetur adipisicing elit.
          Eveniet, autem maiores. Nihil et odit animi eveniet, asperiores natus eius maiores earum molestiae,
          saepe cupiditate provident officiis! Quia aliquam illo laudantium. </p>
        </div>
        <div>
          <p><strong>UltraHD Kamera: </strong> Lorem, ipsum dolor sit amet consectetur adipisicing elit.
          Eveniet, autem maiores. Nihil et odit animi eveniet, asperiores natus eius maiores earum molestiae,
          saepe cupiditate provident officiis! Quia aliquam illo laudantium. </p>
        </div>
        <div>
          <p><strong>Dómkamera: </strong> Lorem, ipsum dolor sit amet consectetur adipisicing elit.
          Eveniet, autem maiores. Nihil et odit animi eveniet, asperiores natus eius maiores earum molestiae,
          saepe cupiditate provident officiis! Quia aliquam illo laudantium. </p>
        </div>
        <div>
          <p><strong>Csőkamera: </strong> Lorem, ipsum dolor sit amet consectetur adipisicing elit.
          Eveniet, autem maiores. Nihil et odit animi eveniet, asperiores natus eius maiores earum molestiae,
          saepe cupiditate provident officiis! Quia aliquam illo laudantium. </p>
        </div>
        <div>
          <p><strong>Boxkamera: </strong> Lorem, ipsum dolor sit amet consectetur adipisicing elit.
          Eveniet, autem maiores. Nihil et odit animi eveniet, asperiores natus eius maiores earum molestiae,
          saepe cupiditate provident officiis! Quia aliquam illo laudantium. </p>
        </div>
      </article>
    </div>
  );
}

const ResultsMenu = ({camera, mount, numOfCams, comesWithSetup, isLoading}) => {
  return (
    <div>
      <h3>Megfelelő Kamera:</h3>
      {!isLoading && 
        <>
          <strong>{camera.name}</strong>
          <br/>
          <span className={comesWithSetup ? "line-through" : undefined} style={{marginRight: "1rem"}} >{camera.price * numOfCams}Ft</span>
          {comesWithSetup && <span>{(camera.price * 0.9) * numOfCams}Ft</span>}
        </>      
      }
      

      <h3>Hozzá tartozó rögzítő:</h3>
      <strong>{mount.name}</strong>
      <br/>
      <span className={comesWithSetup ? "line-through" : undefined} style={{marginRight: "1rem"}} >{mount.price}Ft</span>
      {comesWithSetup && <span>{mount.price * 0.9}Ft</span>}

      <h3>Összesen:</h3>
      <span className={comesWithSetup ? "line-through" : undefined} style={{marginRight: "1rem"}}>{camera.price * numOfCams + mount.price}Ft</span>
      {comesWithSetup && <span>{(camera.price * 0.9) * numOfCams + mount.price * 0.9}Ft</span>}
    </div>
  )
}

export default App;
