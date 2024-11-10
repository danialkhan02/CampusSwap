import {
  Accordion, AccordionDetails, AccordionSummary, Drawer,
} from '@mui/material';
import { ECategory, ECondition } from 'pages/HomePage/constants';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useCallback, useState } from 'react';
import Divider from '@mui/material/Divider';
import DrawerHeader from 'pages/HomePage/components/DrawerHeader';
import ConditionFilter from 'pages/HomePage/components/ConditionFilter';
import CategoryFilter from 'pages/HomePage/components/CategoryFilter';
import PriceFilter from 'pages/HomePage/components/PriceFilter';
import LocationFilter from 'pages/HomePage/components/LocationFilter';
import LoadGoogleMaps from 'pages/UserProfile/components/LoadGoogleMaps';
import { IFilters, ILocation } from 'pages/HomePage/queries';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Button from '@mui/material/Button';


type TProps = {
  open: boolean;
  onClose: () => void;
  filters: IFilters;
  onApply: () => void;
  onClear: () => void;
  onFilterChange: (newFilters: IFilters) => void;
}

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  '&.MuiAccordion-root': {
    boxShadow: 'none',
    '&:before': {
      display: 'none',
    },
    '&.Mui-expanded': {
      margin: 0,
    },
  },
  '& .MuiAccordionSummary-root': {
    minHeight: 48,
    padding: 0,
    '&.Mui-expanded': {
      minHeight: 48,
    },
  },
  '& .MuiAccordionSummary-content': {
    margin: '12px 0',
    '&.Mui-expanded': {
      margin: '12px 0',
    },
  },
  '& .MuiAccordionDetails-root': {
    padding: '0 0 16px 0',
  },
}));

// Create a styled Box for the content container
const ContentContainer = styled(Box)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});

// Create a styled Box for the scrollable area
const ScrollableContent = styled(Box)({
  flexGrow: 1,
  overflow: 'auto',
  paddingBottom: '80px', // Add padding to prevent content from being hidden behind sticky buttons
});

// Create a styled Box for the sticky bottom section
const StickyBottom = styled(Box)(({ theme }) => ({
  position: 'sticky',
  bottom: 0,
  backgroundColor: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
  width: '100%',
  zIndex: 1,
}));

export default function FilterDrawer({
  open, filters, onFilterChange, onClose, onApply, onClear,
}: TProps) {
  const [expanded, setExpanded] = useState<string[]>(['condition', 'category', 'price', 'location']);

  const handleAccordionChange = (panel: string) => (
    _: React.SyntheticEvent,
    isExpanded: boolean,
  ) => {
    setExpanded((prev) => (isExpanded
      ? [...prev, panel]
      : prev.filter((item) => item !== panel)));
  };
  // Handle condition checkboxes
  const handleConditionChange = useCallback((condition: ECondition) => {
    onFilterChange({
      ...filters,
      condition: {
        ...filters.condition,
        [condition]: !filters.condition[condition],
      },
    });
  }, [filters, onFilterChange]);

  // Handle category radio buttons
  const handleCategoryChange = useCallback((category: ECategory | null) => {
    onFilterChange({
      ...filters,
      category,
    });
  }, [filters, onFilterChange]);

  // Handle price slider changes
  const handlePriceChange = useCallback((_event: Event | null, newValue: number | number[]) => {
    onFilterChange({
      ...filters,
      price: newValue as [number, number],
    });
  }, [filters, onFilterChange]);

  // Handle direct price input changes
  const handleInputRangeChange = useCallback((newValue: [number, number]) => {
    onFilterChange({
      ...filters,
      price: newValue,
    });
  }, [filters, onFilterChange]);

  // Handle reset
  const handleReset = () => {
    onClear();
  };

  // Handle Location Change
  const handleLocationChange = useCallback((location: ILocation) => {
    onFilterChange({
      ...filters,
      location: {
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
      },
    });
  }, [filters, onFilterChange]);

  // Handle radius changes
  const handleRadiusChange = useCallback((radius: number) => {
    onFilterChange({
      ...filters,
      radius,
    });
  }, [filters, onFilterChange]);

  // Check if any filters are active
  const canReset = Object.values(filters.condition).some((value) => value)
      || filters.category !== null
      || filters.price[0] !== 0
      || filters.price[1] !== 200
      || filters.seller_rating !== 0
      || filters.location.address !== '';

  return (
    <Drawer
      anchor='right'
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: 320, boxShadow: (theme) => theme.shadows[20], backgroundColor: 'white' } }}
    >
      <ContentContainer>
        <Box>
          {/* Header */}
          <DrawerHeader
            onClose={onClose}
            handleReset={handleReset}
            canReset={canReset}
          />

          <Divider />
        </Box>

        <ScrollableContent>
          <Box sx={{ p: 2 }}>
            {/* Filter Content */}
            <Stack spacing={1}>
              {/* Condition */}
              <StyledAccordion
                expanded={expanded.includes('condition')}
                onChange={handleAccordionChange('condition')}
                disableGutters
              >
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                >
                  <Typography variant='subtitle1'>Condition</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ConditionFilter
                    filters={filters}
                    handleConditionChange={handleConditionChange}
                  />
                </AccordionDetails>
              </StyledAccordion>
              {/* Category */}
              <StyledAccordion
                expanded={expanded.includes('category')}
                onChange={handleAccordionChange('category')}
                disableGutters
              >
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                >
                  <Typography variant='subtitle1'>Category</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <CategoryFilter
                    filters={filters}
                    handleCategoryChange={handleCategoryChange}
                  />
                </AccordionDetails>
              </StyledAccordion>
              {/* Price */}
              <StyledAccordion
                expanded={expanded.includes('price')}
                onChange={handleAccordionChange('price')}
                disableGutters
              >
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                >
                  <Typography variant='subtitle1'>Price</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <PriceFilter
                    filters={filters}
                    handlePriceChange={handlePriceChange}
                    handleInputRangeChange={handleInputRangeChange}
                  />
                </AccordionDetails>
              </StyledAccordion>
              {/* Location */}
              <StyledAccordion
                expanded={expanded.includes('location')}
                onChange={handleAccordionChange('location')}
                disableGutters
              >
                <AccordionSummary
                  expandIcon={<ArrowDropDownIcon />}
                >
                  <Typography variant='subtitle1'>Location</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <LoadGoogleMaps>
                    <LocationFilter
                      filters={filters}
                      onLocationChange={handleLocationChange}
                      onRadiusChange={handleRadiusChange}
                    />
                  </LoadGoogleMaps>
                </AccordionDetails>
              </StyledAccordion>
            </Stack>
          </Box>
        </ScrollableContent>
        <StickyBottom>
          <Stack direction='row' spacing={2}>
            <Button
              fullWidth
              variant='outlined'
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              fullWidth
              variant='contained'
              onClick={onApply}
              disabled={!canReset} // Disable if no filters are active
            >
              Apply Filters
            </Button>
          </Stack>
        </StickyBottom>
      </ContentContainer>
    </Drawer>
  );
}
