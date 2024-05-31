import { Modal, CircularProgress } from '@material-ui/core';

const LoadingModal = ({ loading }) => (
  <Modal open={loading}>
    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
      <div style={{backgroundColor: 'white', padding: '30px', borderRadius: '5px'}}>
        <CircularProgress />
      </div>
    </div>
  </Modal>
);

export default LoadingModal;