'use client';

import {
  fetchOnrampConfig,
  fetchOnrampOptions,
  fetchOnrampQuote,
} from '@coinbase/onchainkit/fund';
import { Tab, Tabs } from '@nextui-org/react';
import { Key, useCallback, useEffect, useState } from 'react';
import {
  Mode,
  useCoinbaseRampTransaction,
} from '../contexts/CoinbaseRampTransactionContext';
import { generateSellOptions } from '../queries';
import { CustomIntegrationDemo } from './CustomIntegrationDemo';
import { FundButtonDemo } from './FundButtonDemo';
import { FundCardDemo } from './FundCardDemo';

interface ICryptoRampProps {
  partnerUserId?: string;
}

export const CryptoRamp = ({ partnerUserId }: ICryptoRampProps) => {
  const [step, setStep] = useState(1);

  const {
    mode,
    setMode,
    setBuyConfig,
    authenticated,
    setPartnerUserId,
    setLoadingBuyConfig,
    setLoadingBuyOptions,
    buyOptions,
    setBuyOptions,
    selectedCountry,
    selectedSubdivision,
    buyConfig,
    setSellOptions,
    sellOptions,
    setLoadingSellOptions,
    loadingSellOptions,
    rampTransaction,
    selectedPurchaseCurrency,
    selectedPurchaseCurrencyNetwork,
    isOnrampActive,
    setBuyQuote,
    setFetchingQuote,
  } = useCoinbaseRampTransaction();

  useEffect(() => {
    if (partnerUserId) {
      setPartnerUserId(partnerUserId);
    } else {
      const storedPartnerId = localStorage.getItem('cb_ramp_user_id');
      if (storedPartnerId) {
        setPartnerUserId(storedPartnerId);
      } else {
        const newPartnerId = crypto.randomUUID();
        localStorage.setItem('cb_ramp_user_id', newPartnerId);
        setPartnerUserId(newPartnerId);
      }
    }
  }, [partnerUserId, setPartnerUserId]);

  useEffect(() => {
    const getBuyConfig = async () => {
      if (!buyConfig) {
        try {
          setLoadingBuyConfig(true);
          const config = await fetchOnrampConfig();
          setBuyConfig(config);
        } catch (error) {
          console.error('Error generating buy config', error);
        } finally {
          setLoadingBuyConfig(false);
        }
      }
    };

    const getBuyOptions = async () => {
      try {
        setLoadingBuyOptions(true);
        if (selectedCountry && !buyOptions) {
          const options = await fetchOnrampOptions({
            country: selectedCountry.id,
            subdivision: selectedSubdivision || '',
          });
          setBuyOptions(options);
        }
      } catch (error) {
        console.error('Error fetching buy options:', error);
      } finally {
        setLoadingBuyOptions(false);
      }
    };

    const getSellOptions = async () => {
      try {
        setLoadingSellOptions(true);
        if (!loadingSellOptions && selectedCountry && !sellOptions) {
          const options = await generateSellOptions({
            country: selectedCountry.id,
            subdivision: selectedSubdivision || '',
          });
          setSellOptions(options);
        }
      } catch (error) {
        console.error('Error fetching sell options:', error);
      } finally {
        setLoadingSellOptions(false);
      }
    };

    const fetchBuyQuote = async () => {
      if (
        !rampTransaction?.currency ||
        !rampTransaction.paymentMethod ||
        !rampTransaction.country ||
        !selectedPurchaseCurrency?.symbol
      ) {
        return;
      }

      setFetchingQuote(true);
      try {
        const response = await fetchOnrampQuote({
          purchaseCurrency: selectedPurchaseCurrency?.symbol || '',
          paymentCurrency: String(rampTransaction?.currency),
          paymentMethod: String(rampTransaction?.paymentMethod),
          paymentAmount: Number(rampTransaction?.amount).toFixed(2),
          country: String(rampTransaction?.country?.id),
          subdivision: String(selectedSubdivision),
          purchaseNetwork: selectedPurchaseCurrencyNetwork?.name || '',
        });
        setBuyQuote(response);
      } catch (err) {
        console.error('Buy Quote Fetch Failed', err);
      } finally {
        setFetchingQuote(false);
      }
    };

    const fetchSellQuote = async () => {
      try {
        setFetchingQuote(false);
      } catch (err) {
        console.error('RECEIVED AN ERROR FOR SELL QUOTE', err as Error);
      }
    };

    getSellOptions();
    getBuyConfig();
    getBuyOptions();

    const intervalId = setInterval(
      isOnrampActive ? fetchBuyQuote : fetchSellQuote,
      10000
    );

    return () => clearInterval(intervalId);
  }, [selectedCountry, selectedSubdivision]);

  useEffect(() => {
    if (authenticated && step < 2) {
      setStep(2);
    } else if (!authenticated && step > 1) {
      setStep(1);
    }
  }, [authenticated, step, setStep]);

  const handleModeChange = useCallback(
    (key: Key) => {
      setMode(key as Mode);
    },
    [setMode]
  );

  return (
    <div className="flex justify-center items-center min-h-screen bg-zinc-950">
      <div className="crypto-ramp bg-black p-8 rounded-lg shadow-md w-full h-screen">
        <div className="flex justify-between mb-6 min-h-20 flex-col md:flex-row gap-4">
          <div className="flex gap-6 justify-center items-center w-full flex-col">
            <Tabs
              aria-label="Options"
              onSelectionChange={handleModeChange}
              selectedKey={mode}
            >
              <Tab key="fund-card" title="Fund Card">
                <FundCardDemo />
              </Tab>
              <Tab key="fund-button" title="Fund Button">
                <FundButtonDemo />
              </Tab>
              <Tab key="onramp" title="Custom integration">
                <CustomIntegrationDemo />
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}; 