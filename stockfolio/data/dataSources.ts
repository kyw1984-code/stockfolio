/**
 * 데이터 출처 정보 상수
 * 모든 화면 하단 + 출처 상세 페이지에서 사용
 */

export interface DataSourceInfo {
  id: string;
  nameKo: string;
  nameEn: string;
  descriptionKo: string;
  descriptionEn: string;
  url: string;
  disclaimer?: string;
}

export const DATA_SOURCES: DataSourceInfo[] = [
  {
    id: 'fsc',
    nameKo: '금융위원회 (공공데이터포털)',
    nameEn: 'Financial Services Commission (data.go.kr)',
    descriptionKo:
      '본 앱은 공공데이터포털에서 제공하는 \'금융위원회_주식시세정보\' 및 \'금융위원회_KRX상장종목정보\' API를 활용하고 있습니다. 「공공데이터의 제공 및 이용 활성화에 관한 법률」에 따라 이용합니다.',
    descriptionEn:
      'This app uses stock price and KRX listing data from the Financial Services Commission via the Korean Public Data Portal (data.go.kr), used in accordance with the Public Data Act.',
    url: 'https://data.go.kr',
  },
  {
    id: 'bok',
    nameKo: '한국은행 경제통계시스템 (ECOS)',
    nameEn: 'Bank of Korea Economic Statistics System (ECOS)',
    descriptionKo:
      '본 앱은 한국은행이 제공하는 환율 통계 데이터를 활용하고 있습니다. 한국은행 저작권 방침에 따라 출처를 표시하며, 데이터 가공 시 가공 사실을 명시합니다.',
    descriptionEn:
      'This app uses exchange rate statistics provided by the Bank of Korea. Source attribution is provided in accordance with the Bank of Korea copyright policy.',
    url: 'https://ecos.bok.or.kr',
    disclaimer: '환율을 기반으로 원화 환산한 값은 가공된 데이터입니다.',
  },
  {
    id: 'finnhub',
    nameKo: 'Finnhub',
    nameEn: 'Finnhub',
    descriptionKo:
      '미국 주식 시세는 15분 지연된 데이터입니다. 배당 데이터는 Finnhub에서 제공합니다.',
    descriptionEn:
      'US stock quotes are delayed by 15 minutes. Dividend data is provided by Finnhub.',
    url: 'https://finnhub.io',
  },
];

export const DISCLAIMER_KO =
  '본 앱은 투자 조언을 제공하지 않습니다. 표시되는 데이터는 참고용이며, 실제 거래 시에는 증권사 등 공식 채널의 데이터를 확인하시기 바랍니다. 투자 판단에 따른 손실에 대해 본 앱은 책임을 지지 않습니다.';

export const DISCLAIMER_EN =
  'This app does not provide investment advice. Data shown is for reference only. Please verify with official sources before making investment decisions. The app is not liable for investment losses.';
