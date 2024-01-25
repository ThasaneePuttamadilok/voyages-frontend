import React from 'react';
import LOADINGLOGO from '@/assets/sv-logo_v2_notext.svg';
import HeaderLogoSearch from '@/components/NavigationComponents/Header/HeaderSearchLogo';
const DocumentPageHold: React.FC = () => {
  return (
    <>
      <HeaderLogoSearch />
      <div style={{ marginTop: '15%', textAlign: 'center' }}>
        <div>Document page is coming soon</div>
        <img
          src={LOADINGLOGO}
          alt="document"
          style={{ width: '30%', padding: '5%' }}
        />
      </div>
    </>
  );
};

export default DocumentPageHold;
