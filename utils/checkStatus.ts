import { base, createBaseAccountSDK } from "@base-org/account";
import toast from "react-hot-toast";

export const checkStatus = async (callsId: string, attempt: number = 1): Promise<boolean> => {

    const provider = createBaseAccountSDK({
        appName: "Bill test app",
        appLogoUrl: "https://www.houseproto.fun/pfp.jpg",
        appChainIds: [base.constants.CHAIN_IDS.base],
    }).getProvider();

  const status:any = await provider.request({
    method: 'wallet_getCallsStatus',
    params: [callsId]
  });
  
  if (status.status === "CONFIRMED") {
    console.log('Batch completed successfully!');
    console.log('Transaction receipts:', status.receipts);
    toast.success('Transaction completed successfully!', { id: callsId });
    return true;
  } else if (status.status === "PENDING") {
    if (attempt < 10) { // Increased max attempts
      console.log(`Batch still pending... (Attempt ${attempt}/10)`);
      // Use a proper promise-based delay instead of setTimeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      return await checkStatus(callsId, attempt + 1);
    } else {
      console.error('Batch failed: Maximum retry attempts (10) reached');
      toast.error('Transaction check failed: Maximum attempts reached', { id: callsId });
      return false;
    }
  } else {
    console.error('Batch failed with status:', status.status);
    toast.error('Transaction failed', { id: callsId });
    return false;
  }
};