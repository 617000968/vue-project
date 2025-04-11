import { ElMessage } from 'element-plus';

let messageInstance = null;

const resetMessage = (options) => {
  if (messageInstance) {
    messageInstance.close();
  }
  messageInstance = ElMessage(options);
};

['success', 'warning', 'info', 'error'].forEach((type) => {
  resetMessage[type] = (options) => {
    if (typeof options === 'string') {
      options = { message: options };
    }
    options.type = type;
    return resetMessage(options);
  };
});

export default resetMessage;
