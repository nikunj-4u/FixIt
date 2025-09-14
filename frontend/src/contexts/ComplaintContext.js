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
    axios.defaults.baseURL = 'http://localhost:5001';
  }, []);

  const fetchComplaints = useCallback(async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      console.log('Fetching complaints with filters:', filters);
      const params = new URLSearchParams(filters);
      const url = `/api/complaints?${params}`;
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
      console.log('Creating complaint with data:', complaintData);
      const response = await axios.post('/api/complaints', complaintData);
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
      const response = await axios.patch(`/api/complaints/${complaintId}/status`, {
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
      const response = await axios.patch(`/api/complaints/${complaintId}/assign`, {
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
      const response = await axios.post(`/api/complaints/${complaintId}/comments`, {
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
      const response = await axios.get('/api/categories');
      console.log('Categories fetched:', response.data);
      dispatch({ type: 'SET_CATEGORIES', payload: response.data });
    } catch (error) {
      console.error('Error fetching categories:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch categories'
      });
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get('/api/complaints/stats/overview');
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
