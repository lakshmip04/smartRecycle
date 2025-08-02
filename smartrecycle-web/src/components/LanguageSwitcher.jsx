import React from 'react';
import { useTranslation } from 'react-i18next';
import { FormControl, Select, MenuItem, Box, Typography } from '@mui/material';
import { Language as LanguageIcon } from '@mui/icons-material';

const LanguageSwitcher = ({ 
  variant = 'standard', 
  size = 'small',
  showIcon = true,
  showLabel = false,
  sx = {} 
}) => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: t('languages.english'), flag: '🇺🇸' },
    { code: 'hi', name: t('languages.hindi'), flag: '🇮🇳' },
    { code: 'kn', name: t('languages.kannada'), flag: '🇮🇳' },
    { code: 'te', name: t('languages.telugu'), flag: '🇮🇳' },
    { code: 'ml', name: t('languages.malayalam'), flag: '🇮🇳' },
    { code: 'ta', name: t('languages.tamil'), flag: '🇮🇳' },
  ];

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
    // Store language preference in localStorage
    localStorage.setItem('i18nextLng', selectedLanguage);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
      {showIcon && <LanguageIcon fontSize="small" />}
      {showLabel && (
        <Typography variant="body2" sx={{ minWidth: 'fit-content' }}>
          Language:
        </Typography>
      )}
      <FormControl variant={variant} size={size} sx={{ minWidth: 120 }}>
        <Select
          value={i18n.language}
          onChange={handleLanguageChange}
          displayEmpty
          sx={{ 
            fontSize: '0.875rem',
            '& .MuiSelect-select': {
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }
          }}
        >
          {languages.map((lang) => (
            <MenuItem key={lang.code} value={lang.code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSwitcher;