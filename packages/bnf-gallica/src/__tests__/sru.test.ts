import { searchCatalogue } from '../sru.js';
import { BnfRequestError } from '../types.js';

// Fixture trimmed from a real, live https://gallica.bnf.fr/SRU response
// (captured during integration testing against the documented endpoint;
// CI never calls the live endpoint) - a public-domain sheet-music notice and
// a digitized sound recording, which is what exercises both the
// "most-specific dc:type label" and "public domain" normalization paths.
const SRU_RESPONSE_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<srw:searchRetrieveResponse xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/" xmlns:srw="http://www.loc.gov/zing/srw/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <srw:version>1.2</srw:version>
  <srw:numberOfRecords>2</srw:numberOfRecords>
  <srw:records>
    <srw:record>
      <srw:recordSchema>http://www.openarchives.org/OAI/2.0/OAIdc.xsd</srw:recordSchema>
      <srw:recordData>
        <oai_dc:dc>
          <dc:creator>Mozart, Wolfgang Amadeus (1756-1791). Compositeur</dc:creator>
          <dc:format>1 partition (138 p.)</dc:format>
          <dc:format>application/pdf</dc:format>
          <dc:identifier>https://gallica.bnf.fr/ark:/12148/bpt6k11767775</dc:identifier>
          <dc:relation>Notice d'oeuvre : http://catalogue.bnf.fr/ark:/12148/cb139234789</dc:relation>
          <dc:relation>Notice du catalogue : http://catalogue.bnf.fr/ark:/12148/cb45210184v</dc:relation>
          <dc:rights>domaine public</dc:rights>
          <dc:rights>public domain</dc:rights>
          <dc:title>Messe de Requiem / par Mozart</dc:title>
          <dc:type>Genre musical : divers</dc:type>
          <dc:type>partition musicale</dc:type>
          <dc:type>score</dc:type>
        </oai_dc:dc>
      </srw:recordData>
    </srw:record>
    <srw:record>
      <srw:recordSchema>http://www.openarchives.org/OAI/2.0/OAIdc.xsd</srw:recordSchema>
      <srw:recordData>
        <oai_dc:dc>
          <dc:creator>Planquette, Robert (1848-1903). Compositeur</dc:creator>
          <dc:creator>Caruso, Enrico (1873-1921). Tenor</dc:creator>
          <dc:date>19..</dc:date>
          <dc:identifier>https://gallica.bnf.fr/ark:/12148/bpt6k10801867</dc:identifier>
          <dc:identifier>Numero commercial : Gramophone 2-032042</dc:identifier>
          <dc:relation>Notice du catalogue : http://catalogue.bnf.fr/ark:/12148/cb378900597</dc:relation>
          <dc:rights>domaine public</dc:rights>
          <dc:rights>public domain</dc:rights>
          <dc:title>Le Regiment de Sambre et Meuse</dc:title>
          <dc:type>sound</dc:type>
          <dc:type>document sonore</dc:type>
        </oai_dc:dc>
      </srw:recordData>
    </srw:record>
  </srw:records>
</srw:searchRetrieveResponse>`;

const DIAGNOSTIC_RESPONSE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<srw:searchRetrieveResponse xmlns:srw="http://www.loc.gov/zing/srw/" xmlns:diag="http://www.loc.gov/zing/srw/diagnostic/">
  <srw:version>1.2</srw:version>
  <srw:diagnostics>
    <diag:diagnostic>
      <diag:message>Malformed CQL query</diag:message>
    </diag:diagnostic>
  </srw:diagnostics>
</srw:searchRetrieveResponse>`;

function mockFetchOnce(xml: string, ok = true) {
  (global as any).fetch = jest.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    text: () => Promise.resolve(xml),
  });
}

describe('searchCatalogue', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('extracts the Gallica ARK from dc:identifier, not a catalogue-notice or commercial-number identifier', async () => {
    mockFetchOnce(SRU_RESPONSE_XML);
    const records = await searchCatalogue('Mozart Requiem');
    expect(records).toHaveLength(2);
    expect(records[0].ark).toBe('bpt6k11767775');
    expect(records[1].ark).toBe('bpt6k10801867');
  });

  it('prefers the specific, human-readable dc:type label over a generic single-word one', async () => {
    mockFetchOnce(SRU_RESPONSE_XML);
    const [score, recording] = await searchCatalogue('Mozart Requiem');
    expect(score.documentType).toBe('partition musicale');
    expect(recording.documentType).toBe('document sonore');
  });

  it('flags public-domain rights without treating that as a commercial-reuse waiver', async () => {
    mockFetchOnce(SRU_RESPONSE_XML);
    const [score] = await searchCatalogue('Mozart Requiem');
    expect(score.isPublicDomainWork).toBe(true);
  });

  it('extracts the "Notice du catalogue" relation as catalogueUrl, not the "Notice d\'oeuvre" one', async () => {
    mockFetchOnce(SRU_RESPONSE_XML);
    const [score] = await searchCatalogue('Mozart Requiem');
    expect(score.catalogueUrl).toBe('http://catalogue.bnf.fr/ark:/12148/cb45210184v');
  });

  it('builds the permalink from the extracted ark', async () => {
    mockFetchOnce(SRU_RESPONSE_XML);
    const [score] = await searchCatalogue('Mozart Requiem');
    expect(score.permalink).toBe('https://gallica.bnf.fr/ark:/12148/bpt6k11767775');
  });

  it('throws BnfRequestError when the SRU server reports a diagnostic', async () => {
    mockFetchOnce(DIAGNOSTIC_RESPONSE_XML);
    await expect(searchCatalogue('(((')).rejects.toThrow(BnfRequestError);
  });

  it('throws BnfRequestError on a non-OK HTTP response', async () => {
    mockFetchOnce('', false);
    await expect(searchCatalogue('anything')).rejects.toThrow(BnfRequestError);
  });
});
