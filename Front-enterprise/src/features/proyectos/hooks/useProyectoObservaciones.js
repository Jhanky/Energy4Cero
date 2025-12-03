import { useState } from 'react';

export const useProyectoObservaciones = (proyecto, actualizarProyecto) => {
  const [editingObservations, setEditingObservations] = useState(false);
  const [editingComments, setEditingComments] = useState(false);
  const [aireObservations, setAireObservations] = useState('');
  const [internalComments, setInternalComments] = useState('');

  const handleEditObservations = () => {
    setAireObservations(proyecto?.aire_observations || '');
    setEditingObservations(true);
  };

  const handleCancelObservations = () => {
    setEditingObservations(false);
    setAireObservations('');
  };

  const handleSaveObservations = async () => {
    const result = await actualizarProyecto({ aire_observations: aireObservations });
    if (result.success) {
      setEditingObservations(false);
      setAireObservations('');
    }
    return result;
  };

  const handleEditComments = () => {
    setInternalComments(proyecto?.internal_comments || '');
    setEditingComments(true);
  };

  const handleCancelComments = () => {
    setEditingComments(false);
    setInternalComments('');
  };

  const handleSaveComments = async () => {
    const result = await actualizarProyecto({ internal_comments: internalComments });
    if (result.success) {
      setEditingComments(false);
      setInternalComments('');
    }
    return result;
  };

  return {
    // Estados de edición
    editingObservations,
    editingComments,

    // Valores temporales
    aireObservations,
    setAireObservations,
    internalComments,
    setInternalComments,

    // Handlers
    handleEditObservations,
    handleCancelObservations,
    handleSaveObservations,
    handleEditComments,
    handleCancelComments,
    handleSaveComments
  };
};
