import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import axios from 'axios';

const ComplaintContext = createContext();

const complaintReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_COMPLAINTS':
      return { ...state, complaints: action.payload, loading: false };
    case 'ADD_COMPLAINT':
      return { ...state, complaints: [action.payload, ...state.complaints] };
    case 'UPDATE_COMPLAINT':
      return {
        ...state,
        complaints: state.complaints.map(complaint =>
          complaint._id === action.payload._id ? action.payload : complaint
        )
      };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_STATS':
      return { ...state, stats: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  complaints: [],
  categories: [],
  stats: null,
  loading: false,
  error: null
};

export const ComplaintProvider = ({ children }) => {
  const [state, dispatch] = useReducer(complaintReducer, initialState);

  // Set base URL for API
  useEffect(() => {
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    axios.defaults.baseURL = apiBaseUrl;
  }, []);

  const fetchComplaints = useCallback(async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('Fetching complaints with filters:', filters);
      const params = new URLSearchParams(filters);
      const url = `/complaints?${params}`;
      console.log('Making request to:', url);
      const response = await axios.get(url);
      console.log('Complaints response:', response.data);
      dispatch({ type: 'SET_COMPLAINTS', payload: response.data.complaints });
    } catch (error) {
      console.error('Error fetching complaints:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch complaints'
      });
    }
  }, []);

  const createComplaint = useCallback(async (complaintData) => {
    try {
      // Normalize images to string URLs per backend schema
      const normalizedImages = Array.isArray(complaintData.images)
        ? complaintData.images.map((img) => {
            if (typeof img === 'string') return img;
            if (img && typeof img === 'object' && img.url) return img.url;
            return String(img || '');
          }).filter(Boolean)
        : [];

      const payload = { ...complaintData, images: normalizedImages };
      console.log('Creating complaint with data:', payload);
      const response = await axios.post('/complaints', payload);
      console.log('Complaint created successfully:', response.data);
      dispatch({ type: 'ADD_COMPLAINT', payload: response.data.complaint });
      return { success: true, complaint: response.data.complaint };
    } catch (error) {
      console.error('Error creating complaint:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create complaint';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateComplaintStatus = useCallback(async (complaintId, status, resolution = '') => {
    try {
      const response = await axios.patch(`/complaints/${complaintId}/status`, {
        status,
        resolution
      });
      dispatch({ type: 'UPDATE_COMPLAINT', payload: response.data.complaint });
      return { success: true, complaint: response.data.complaint };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update complaint';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const assignComplaint = useCallback(async (complaintId, assignedTo) => {
    try {
      const response = await axios.patch(`/complaints/${complaintId}/assign`, {
        assignedTo
      });
      dispatch({ type: 'UPDATE_COMPLAINT', payload: response.data.complaint });
      return { success: true, complaint: response.data.complaint };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to assign complaint';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const addComment = useCallback(async (complaintId, comment) => {
    try {
      const response = await axios.post(`/complaints/${complaintId}/comments`, {
        comment
      });
      dispatch({ type: 'UPDATE_COMPLAINT', payload: response.data.complaint });
      return { success: true, complaint: response.data.complaint };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add comment';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      console.log('Fetching categories...');
      const response = await axios.get('/categories');
      let apiCategories = Array.isArray(response.data) ? response.data : [];
      // Fallback to default enum categories if API returns none
      if (apiCategories.length === 0) {
        apiCategories = [
          { _id: 'mess', name: 'mess', value: 'mess' },
          { _id: 'internet', name: 'internet', value: 'internet' },
          { _id: 'water', name: 'water', value: 'water' },
          { _id: 'electricity', name: 'electricity', value: 'electricity' },
          { _id: 'room_maintenance', name: 'room_maintenance', value: 'room_maintenance' },
          { _id: 'security', name: 'security', value: 'security' },
          { _id: 'other', name: 'other', value: 'other' }
        ];
      }
      console.log('Categories resolved:', apiCategories);
      dispatch({ type: 'SET_CATEGORIES', payload: apiCategories });
    } catch (error) {
      console.error('Error fetching categories:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch categories'
      });
      // Provide defaults on error as well
      dispatch({
        type: 'SET_CATEGORIES',
        payload: [
          { _id: 'mess', name: 'mess', value: 'mess' },
          { _id: 'internet', name: 'internet', value: 'internet' },
          { _id: 'water', name: 'water', value: 'water' },
          { _id: 'electricity', name: 'electricity', value: 'electricity' },
          { _id: 'room_maintenance', name: 'room_maintenance', value: 'room_maintenance' },
          { _id: 'security', name: 'security', value: 'security' },
          { _id: 'other', name: 'other', value: 'other' }
        ]
      });
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get('/complaints/stats/overview');
      dispatch({ type: 'SET_STATS', payload: response.data });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch statistics'
      });
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    ...state,
    fetchComplaints,
    createComplaint,
    updateComplaintStatus,
    assignComplaint,
    addComment,
    fetchCategories,
    fetchStats,
    clearError
  };

  return (
    <ComplaintContext.Provider value={value}>
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaint = () => {
  const context = useContext(ComplaintContext);
  if (!context) {
    throw new Error('useComplaint must be used within a ComplaintProvider');
  }
  return context;
};
