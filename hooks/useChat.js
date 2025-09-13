import { useChatContext } from '../context/ChatContext';

// Custom hook for chat functionality
export const useChat = () => {
    const context = useChatContext();
    
    return {
        // State
        chats: context.chats,
        selectedChat: context.selectedChat,
        activeChats: context.activeChats,
        chatWidths: context.chatWidths,
        isResizing: context.isResizing,
        isSwapping: context.isSwapping,
        isDraggingResize: context.isDraggingResize,
        draggedChatId: context.draggedChatId,
        removingChatId: context.removingChatId,
        controlsLeft: context.controlsLeft,
        
        // Actions
        handleAddChat: context.handleAddChat,
        handleCloseChat: context.handleCloseChat,
        handleChatClick: context.handleChatClick,
        handleChatResize: context.handleChatResize,
        handleSwapChats: context.handleSwapChats,
        handleSlideLeft: context.handleSlideLeft,
        handleSlideRight: context.handleSlideRight,
        handleDragOver: context.handleDragOver,
        handleDrop: context.handleDrop,
        handleChatDrop: context.handleChatDrop,
        handleResizeStart: context.handleResizeStart,
        handleDragRemoveChat: context.handleDragRemoveChat,
        handleDragRestoreChat: context.handleDragRestoreChat,
        handleRemoveChat: context.handleRemoveChat,
        handleRemoveAnimationEnd: context.handleRemoveAnimationEnd,
        handleDeleteAnimationEnd: context.handleDeleteAnimationEnd,
        updateControlsLeft: context.updateControlsLeft,
        handleInfoClick: context.handleInfoClick,
        handleDeleteChat: context.handleDeleteChat,
        
        // Setters
        setChats: context.setChats,
        setSelectedChat: context.setSelectedChat,
        setActiveChats: context.setActiveChats,
        setChatWidths: context.setChatWidths,
        setIsResizing: context.setIsResizing,
        setIsSwapping: context.setIsSwapping,
        setIsDraggingResize: context.setIsDraggingResize,
        setDraggedChatId: context.setDraggedChatId,
        setRemovingChatId: context.setRemovingChatId,
        setControlsLeft: context.setControlsLeft,
    };
}; 