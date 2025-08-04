import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Grid,
  Paper,
} from '@mui/material';
import {
  RemoveCircleOutline,
  Block,
  ShoppingCart,
  Recycling,
  Devices,
} from '@mui/icons-material';

const StyledPaper = (props) => (
  <Paper
    elevation={4}
    sx={{
      p: { xs: 2, sm: 3 },
      borderRadius: 4,
      backdropFilter: 'blur(8px)',
      background: 'rgba(255,255,255,0.92)',
      height: '100%',
      ...props.sx,
    }}
    {...props}
  >
    {props.children}
  </Paper>
);

const WasteGuide = () => {
  const { t } = useTranslation();

  // --- Guide data with translations ---
  const guideSteps = [
    { 
      icon: <RemoveCircleOutline />, 
      title: t('wasteGuide.organicWaste.title'), 
      description: t('wasteGuide.organicWaste.description'),
      type: 'organicWaste',
      color: '#4CAF50'
    },
    { 
      icon: <Recycling />, 
      title: t('wasteGuide.dryWaste.title'), 
      description: t('wasteGuide.dryWaste.description'),
      type: 'dryWaste',
      color: '#2196F3'
    },
    { 
      icon: <Block />, 
      title: t('wasteGuide.sanitaryWaste.title'), 
      description: t('wasteGuide.sanitaryWaste.description'),
      type: 'sanitaryWaste',
      color: '#F44336'
    },
  ];

  // --- 3R Principles Guide ---
  const threeRPrinciples = [
    { 
      icon: <RemoveCircleOutline />, 
      title: t('wasteGuide.reduce.title'), 
      description: t('wasteGuide.reduce.description'),
      color: '#4CAF50'
    },
    { 
      icon: <Block />, 
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
      icon: <Devices />, 
      title: t('wasteGuide.digitalization.title'), 
      description: t('wasteGuide.digitalization.description'),
      color: '#607D8B'
    },
  ];

  return (
    <Grid container spacing={3} className="animate-fade-in">
      {/* Detailed Waste Classification */}
      {guideSteps.map((step, index) => (
        <Grid item xs={12} key={index}>
          <StyledPaper 
            className="hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            sx={{ borderLeft: `4px solid ${step.color}` }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Box sx={{ color: step.color }} className="group-hover:scale-110 transition-transform duration-300">
                {React.cloneElement(step.icon, { style: { fontSize: '2.5rem' } })}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', color: step.color, mb: 1 }}>
                  {step.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
                
                {/* Render detailed waste categories */}
                {step.type === 'organicWaste' && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: step.color, mb: 1 }}>
                        {t('wasteGuide.organicWaste.kitchenWaste.title')}
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {t('wasteGuide.organicWaste.kitchenWaste.items', { returnObjects: true }).map((item, idx) => (
                          <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.5 }}>
                            {item}
                          </Typography>
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: step.color, mb: 1 }}>
                        {t('wasteGuide.organicWaste.gardenWaste.title')}
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {t('wasteGuide.organicWaste.gardenWaste.items', { returnObjects: true }).map((item, idx) => (
                          <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.5 }}>
                            {item}
                          </Typography>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                )}

                {step.type === 'dryWaste' && (
                  <Grid container spacing={2}>
                    {['plastic', 'paper', 'metal', 'glass', 'otherDryWaste', 'eWaste', 'bulbsLighting', 'constructionDebris'].map((category) => (
                      <Grid item xs={12} md={6} key={category}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: step.color, mb: 1 }}>
                          {t(`wasteGuide.dryWaste.${category}.title`)}
                        </Typography>
                        {t(`wasteGuide.dryWaste.${category}.description`) && (
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                            {t(`wasteGuide.dryWaste.${category}.description`)}
                          </Typography>
                        )}
                        <Box component="ul" sx={{ pl: 2, m: 0 }}>
                          {t(`wasteGuide.dryWaste.${category}.items`, { returnObjects: true }).map((item, idx) => (
                            <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.5 }}>
                              {item}
                            </Typography>
                          ))}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {step.type === 'sanitaryWaste' && (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: step.color, mb: 1 }}>
                        {t('wasteGuide.sanitaryWaste.general.title')}
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {t('wasteGuide.sanitaryWaste.general.items', { returnObjects: true }).map((item, idx) => (
                          <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.5 }}>
                            {item}
                          </Typography>
                        ))}
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: step.color, mb: 1 }}>
                        {t('wasteGuide.sanitaryWaste.sharps.title')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
                        {t('wasteGuide.sanitaryWaste.sharps.description')}
                      </Typography>
                      <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {t('wasteGuide.sanitaryWaste.sharps.items', { returnObjects: true }).map((item, idx) => (
                          <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.5 }}>
                            {item}
                          </Typography>
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Box>
            </Box>
          </StyledPaper>
        </Grid>
      ))}

      {/* 3R Principles Section */}
      <Grid item xs={12}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E7D32', mb: 3, textAlign: 'center' }}>
          3R Principles - Sustainable Living Guide
        </Typography>
      </Grid>
      
      {threeRPrinciples.map((principle, index) => (
        <Grid item xs={12} md={6} key={`principle-${index}`}>
          <StyledPaper 
            className="hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            sx={{ borderLeft: `4px solid ${principle.color}` }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ color: principle.color }} className="group-hover:scale-110 transition-transform duration-300">
                {React.cloneElement(principle.icon, { style: { fontSize: '2.5rem' } })}
              </Box>
              <Box>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', color: principle.color, mb: 1 }}>
                  {principle.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {principle.description}
                </Typography>
              </Box>
            </Box>
          </StyledPaper>
        </Grid>
      ))}
    </Grid>
  );
};

export default WasteGuide;
