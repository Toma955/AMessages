import { useThemeContext } from '../context/ThemeContext';

// Custom hook for theme functionality
export const useTheme = () => {
    const context = useThemeContext();
    
    return {
        // State
        selectedTheme: context.selectedTheme,
        currentTheme: context.currentTheme,
        highlightStyle: context.highlightStyle,
        isThemeView: context.isThemeView,
        isTransitioning: context.isTransitioning,
        currentIcons: context.currentIcons,
        
        // Refs
        detailsPanelRef: context.detailsPanelRef,
        
        // Actions
        updateHighlightPosition: context.updateHighlightPosition,
        handleIconTransition: context.handleIconTransition,
        handleThemeClick: context.handleThemeClick,
        handleThemeDoubleClick: context.handleThemeDoubleClick,
        resetHighlight: context.resetHighlight,
        setTheme: context.setTheme,
        
        // Setters
        setSelectedTheme: context.setSelectedTheme,
        setCurrentTheme: context.setCurrentTheme,
        setHighlightStyle: context.setHighlightStyle,
        setIsThemeView: context.setIsThemeView,
        setIsTransitioning: context.setIsTransitioning,
        setCurrentIcons: context.setCurrentIcons,
        
        // Constants
        defaultIcons: context.defaultIcons,
        themeIcons: context.themeIcons,
    };
}; 