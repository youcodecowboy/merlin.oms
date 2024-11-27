import { Drawer, Box, Typography, Button, LinearProgress } from '@mui/material';
import { QrCodeScanner } from '@mui/icons-material';
import { WashRequest } from '../lib/types';

interface WashRequestDrawerProps {
  request: WashRequest;
  open: boolean;
  onClose: () => void;
}

export const WashRequestDrawer = ({ request, open, onClose }: WashRequestDrawerProps) => {
  const completedSteps = request.steps.filter(step => step.status === 'completed').length;
  const progress = (completedSteps / request.steps.length) * 100;

  const handleScanClick = async (stepId: number) => {
    // Implement QR scanning logic
  };

  const handleComplete = async () => {
    // Implement completion logic
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 400, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6">Wash Request</Typography>
        <Typography color="textSecondary">#{request.id}</Typography>
        <Typography>{request.orderId} • {new Date(request.createdAt).toLocaleString()}</Typography>
        
        <Box sx={{ my: 2 }}>
          <Typography>Progress</Typography>
          <LinearProgress variant="determinate" value={progress} />
          <Typography>{completedSteps} of {request.steps.length} steps completed</Typography>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {request.steps.map((step) => (
            <Box
              key={step.id}
              sx={{
                p: 2,
                my: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: step.status === 'completed' ? 'action.selected' : 'background.paper'
              }}
            >
              <Typography variant="subtitle1">
                {step.id}. {step.title}
                <Typography
                  component="span"
                  sx={{
                    ml: 1,
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: step.status === 'in_progress' ? 'info.main' : 'action.disabled',
                    color: 'white'
                  }}
                >
                  {step.status}
                </Typography>
              </Typography>
              <Typography color="textSecondary">{step.description}</Typography>
              
              {step.requiresScan && step.status !== 'completed' && (
                <Button
                  startIcon={<QrCodeScanner />}
                  variant="outlined"
                  onClick={() => handleScanClick(step.id)}
                  sx={{ mt: 1 }}
                >
                  Scan {step.scanTarget}
                </Button>
              )}
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button color="error" variant="text" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={completedSteps !== request.steps.length}
            onClick={handleComplete}
          >
            Complete Request
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}; 