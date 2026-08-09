import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setLocation,
  setLocationLoading,
  setLocationError,
  setManualLocation,
  setRadius,
  setPermissionStatus,
} from '../features/location/locationSlice';

export const useLocation = () => {
  const dispatch = useDispatch();
  const location = useSelector((state) => state.location);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      dispatch(setLocationError('Geolocation is not supported by your browser'));
      return;
    }

    dispatch(setLocationLoading(true));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        dispatch(
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            locationName: 'Current Location',
          })
        );
        dispatch(setLocationLoading(false));
      },
      (error) => {
        let message = 'Unable to get your location';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location permission denied';
          dispatch(setPermissionStatus('denied'));
        }
        dispatch(setLocationError(message));
        dispatch(setLocationLoading(false));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  }, [dispatch]);

  const setManual = useCallback(
    (lat, lng, name) => {
      dispatch(setManualLocation({ latitude: lat, longitude: lng, locationName: name }));
    },
    [dispatch]
  );

  const changeRadius = useCallback(
    (radius) => {
      dispatch(setRadius(radius));
    },
    [dispatch]
  );

  return {
    ...location,
    requestLocation,
    setManualLocation: setManual,
    changeRadius,
  };
};

export default useLocation;
