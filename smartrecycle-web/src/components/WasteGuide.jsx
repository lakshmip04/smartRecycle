import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation'; // Changed from react-router-dom to next/navigation
import {
  Box,
  Typography,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Button,
} from '@mui/material';
import {
  ExpandMore,
  Nature,
  Recycling,
  ReportProblem,
  Person,
  LocalShipping,
  ShoppingCart,
  DeleteOutline,
  Computer,
  Description,
  Build,
  Science,
  Apartment,
  MedicalServices,
  Lightbulb,
  Warning,
  Search,
  Chat,
  FiberManualRecord,
} from '@mui/icons-material';

// --- Reusable Styled Card Component ---
const CategoryCard = ({ title, icon, items = [], description, color }) => {
  const safeItems = Array.isArray(items) ? items : [];
  
  return (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        borderRadius: 4,
        borderTop: `4px solid ${color}`,
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1.5 }}>
          {icon && React.cloneElement(icon, { sx: { color, fontSize: '2rem' } })}
          <Typography variant="h6" component="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {title}
          </Typography>
        </Box>
        {description && (
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontStyle: 'italic' }}>
            {description}
          </Typography>
        )}
        <List dense sx={{ p: 0 }}>
          {safeItems.map((item, idx) => (
            <ListItem key={idx} sx={{ p: 0, mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: '32px' }}>
                <FiberManualRecord sx={{ fontSize: '0.75rem', color }} />
              </ListItemIcon>
              <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

const WasteGuide = () => {
  const { t } = useTranslation();
  const router = useRouter(); // Changed from useNavigate to useRouter

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  // Helper function to safely get translation data
  const safeTranslation = (key, options = {}) => {
    try {
      const result = t(key, options);
      return result || [];
    } catch (error) {
      console.warn(`Translation missing for key: ${key}`);
      return [];
    }
  };

  // --- Comprehensive Guide Data ---
  const wasteData = [
    {
      type: 'organicWaste',
      title: t('wasteGuide.organicWaste.title'),
      icon: <Nature />,
      color: '#4CAF50',
      defaultExpanded: true,
      categories: [
        {
          title: t('wasteGuide.organicWaste.kitchenWaste.title') || 'Kitchen Waste',
          icon: <Person />,
          items: safeTranslation('wasteGuide.organicWaste.kitchenWaste.items', { returnObjects: true }),
        },
        {
          title: t('wasteGuide.organicWaste.gardenWaste.title') || 'Garden Waste',
          icon: <Nature />,
          items: safeTranslation('wasteGuide.organicWaste.gardenWaste.items', { returnObjects: true }),
        },
      ],
    },
    {
      type: 'dryWaste',
      title: t('wasteGuide.dryWaste.title'),
      icon: <Recycling />,
      color: '#2196F3',
      categories: [
        {
          title: t('wasteGuide.dryWaste.plastic.title'),
          icon: <Recycling />,
          items: t('wasteGuide.dryWaste.plastic.items', { returnObjects: true }),
        },
        {
          title: t('wasteGuide.dryWaste.paper.title'),
          icon: <Description />,
          items: t('wasteGuide.dryWaste.paper.items', { returnObjects: true }),
        },
        {
          title: t('wasteGuide.dryWaste.metal.title'),
          icon: <Build />,
          items: t('wasteGuide.dryWaste.metal.items', { returnObjects: true }),
        },
        {
          title: t('wasteGuide.dryWaste.glass.title'),
          icon: <Science />,
          items: t('wasteGuide.dryWaste.glass.items', { returnObjects: true }),
          description: t('wasteGuide.dryWaste.glass.description'),
        },
        {
          title: t('wasteGuide.dryWaste.otherDryWaste.title'),
          icon: <DeleteOutline />,
          items: t('wasteGuide.dryWaste.otherDryWaste.items', { returnObjects: true }),
        },
        {
          title: t('wasteGuide.dryWaste.eWaste.title'),
          icon: <Computer />,
          items: t('wasteGuide.dryWaste.eWaste.items', { returnObjects: true }),
          description: t('wasteGuide.dryWaste.eWaste.description'),
        },
        {
          title: t('wasteGuide.dryWaste.bulbsLighting.title'),
          icon: <Lightbulb />,
          items: t('wasteGuide.dryWaste.bulbsLighting.items', { returnObjects: true }),
          description: t('wasteGuide.dryWaste.bulbsLighting.description'),
        },
        {
          title: t('wasteGuide.dryWaste.constructionDebris.title'),
          icon: <Apartment />,
          items: t('wasteGuide.dryWaste.constructionDebris.items', { returnObjects: true }),
          description: t('wasteGuide.dryWaste.constructionDebris.description'),
        },
      ],
    },
    {
      type: 'sanitaryWaste',
      title: t('wasteGuide.sanitaryWaste.title'),
      icon: <ReportProblem />,
      color: '#F44336',
      categories: [
        {
          title: t('wasteGuide.sanitaryWaste.general.title'),
          icon: <MedicalServices />,
          items: t('wasteGuide.sanitaryWaste.general.items', { returnObjects: true }),
        },
        {
          title: t('wasteGuide.sanitaryWaste.sharps.title'),
          icon: <Warning />,
          items: t('wasteGuide.sanitaryWaste.sharps.items', { returnObjects: true }),
          description: t('wasteGuide.sanitaryWaste.sharps.description'),
        },
      ],
    },
  ];

  // Effect to filter data based on search term
  useEffect(() => {
    // If search is empty, show all data with default expansion
    if (!searchTerm) {
      setFilteredData(wasteData);
      setNotFound(false);
      // Reset to default expansion states
      const defaultExpanded = {};
      wasteData.forEach(section => {
        if (section.defaultExpanded) {
          defaultExpanded[section.type] = true;
        }
      });
      setExpandedSections(defaultExpanded);
      return;
    }

    const lowercasedFilter = searchTerm.toLowerCase();
    let itemsFound = false;

    // Filter logic
    const filtered = wasteData.map(section => {
      const filteredCategories = section.categories.map(category => {
        const filteredItems = category.items.filter(item =>
          item.toLowerCase().includes(lowercasedFilter)
        );

        if (filteredItems.length > 0) {
          itemsFound = true;
        }

        return { ...category, items: filteredItems };
      }).filter(category => category.items.length > 0); // Only keep categories that have matching items

      return { ...section, categories: filteredCategories };
    }).filter(section => section.categories.length > 0); // Only keep sections that have matching categories

    setFilteredData(filtered);
    setNotFound(!itemsFound);

    // Auto-expand logic: if only one section has results, expand it
    if (filtered.length === 1) {
      setExpandedSections({ [filtered[0].type]: true });
    } else if (filtered.length > 1) {
      // If multiple sections have results, expand all of them for better UX
      const expandedState = {};
      filtered.forEach(section => {
        expandedState[section.type] = true;
      });
      setExpandedSections(expandedState);
    } else {
      // No results, collapse all
      setExpandedSections({});
    }
  }, [searchTerm, t]); // Rerun on search term or language change

  const threeRPrinciples = [
    { 
      icon: <Nature />, 
      title: t('wasteGuide.reduce.title'), 
      description: t('wasteGuide.reduce.description'),
      color: '#4CAF50'
    },
    { 
      icon: <DeleteOutline />, 
      title: t('wasteGuide.refuse.title'), 
      description: t('wasteGuide.refuse.description'),
      color: '#FF9800'
    },
    { 
      icon: <ShoppingCart />, 
      title: t('wasteGuide.buyInBulk.title'), 
      description: t('wasteGuide.buyInBulk.description'),
      color: '#9C27B0'
    },
    { 
      icon: <Recycling />, 
      title: t('wasteGuide.recycling.title'), 
      description: t('wasteGuide.recycling.description'),
      color: '#2196F3'
    },
    { 
      icon: <Computer />, 
      title: t('wasteGuide.digitalization.title'), 
      description: t('wasteGuide.digitalization.description'),
      color: '#607D8B'
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }} className="animate-fade-in">
      <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 1, textAlign: 'center' }}>
        {t('wasteGuide.pageTitle') || 'Waste Management Guide'}
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
        {t('wasteGuide.pageSubtitle') || 'Learn how to properly sort and manage different types of waste for a sustainable future'}
      </Typography>

      {/* Search Bar */}
      <Box sx={{ mb: 4, maxWidth: '700px', mx: 'auto' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={t('wasteGuide.searchPlaceholder') || 'Search for waste items...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            sx: { borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.8)' }
          }}
        />
      </Box>

      {/* Not Found Message */}
      {notFound && (
        <Paper
          elevation={3}
          sx={{
            p: 3,
            textAlign: 'center',
            mb: 4,
            borderRadius: 4,
            backgroundColor: '#fff8e1',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            {t('wasteGuide.notFound.title', { searchTerm })}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {t('wasteGuide.notFound.description')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Chat />}
            onClick={() => {
              const encodedMessage = encodeURIComponent(searchTerm);
              router.push(`/user-dashboard?tab=3&message=${encodedMessage}`);
            }}
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#388E3C' },
              borderRadius: 4,
              px: 3,
            }}
          >
            {t('wasteGuide.notFound.button')}
          </Button>
        </Paper>
      )}

      {/* Waste Classification Accordions */}
      {filteredData.map((section) => (
        <Accordion
          key={section.type}
          expanded={expandedSections[section.type] || false}
          onChange={(event, isExpanded) => {
            setExpandedSections(prev => ({
              ...prev,
              [section.type]: isExpanded
            }));
          }}
          sx={{
            mb: 2,
            borderRadius: 4,
            boxShadow: 3,
            '&:before': { display: 'none' },
            '&.Mui-expanded': { margin: '16px 0' },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMore />}
            sx={{
              borderLeft: `5px solid ${section.color}`,
              borderTopLeftRadius: 16,
              borderBottomLeftRadius: 16,
              py: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {React.cloneElement(section.icon, { sx: { color: section.color, fontSize: '2.5rem' } })}
              <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                {section.title}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ p: { xs: 2, sm: 3 }, backgroundColor: '#f9f9f9' }}>
            <Grid container spacing={3}>
              {section.categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.title}>
                  <CategoryCard
                    title={category.title}
                    icon={category.icon}
                    items={category.items}
                    description={category.description}
                    color={section.color}
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* 3R Principles Section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#4CAF50', mb: 3, textAlign: 'center' }}>
          {t('wasteGuide.principlesTitle')}
        </Typography>
        <Grid container spacing={2}>
          {threeRPrinciples.map((principle, index) => (
            <Grid item xs={12} sm={6} md={4} key={`principle-${index}`}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderRadius: 4,
                  height: '100%',
                  borderColor: principle.color,
                }}
              >
                {React.cloneElement(principle.icon, { sx: { color: principle.color, fontSize: '2.5rem' } })}
                <Box>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                    {principle.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {principle.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default WasteGuide;
