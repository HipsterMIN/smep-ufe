<%@page import="java.net.URLDecoder"%>
<%@page import="javax.swing.text.StyledEditorKit.BoldAction"%>
<%@page import="com.dreamsecurity.jcaos.LicenseUtil"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="java.util.ArrayList" %>
<%@ page import="java.util.Date" %>
<%@ page import="java.util.StringTokenizer "%>

<%@ page import="com.dreamsecurity.jcaos.cms.ContentInfo" %>
<%@ page import="com.dreamsecurity.jcaos.cms.SignedData" %>
<%@ page import="com.dreamsecurity.jcaos.cms.SignerInfo" %>
<%@ page import="com.dreamsecurity.jcaos.pkcs.PKCS8" %>
<%@ page import="com.dreamsecurity.jcaos.pkcs.PKCS8PrivateKeyInfo" %>
<%@ page import="com.dreamsecurity.jcaos.protocol.TCP" %>
<%@ page import="com.dreamsecurity.jcaos.ucpid.ISPReqInfo" %>
<%@ page import="com.dreamsecurity.jcaos.ucpid.ISPReqInfoGenerator" %>
<%@ page import="com.dreamsecurity.jcaos.ucpid.PersonInfo" %>
<%@ page import="com.dreamsecurity.jcaos.ucpid.UCPIDRequest" %>
<%@ page import="com.dreamsecurity.jcaos.ucpid.UCPIDRequestGenerator" %>
<%@ page import="com.dreamsecurity.jcaos.ucpid.UCPIDRequestInfo" %>
<%@ page import="com.dreamsecurity.jcaos.ucpid.UCPIDResponse" %>
<%@ page import="com.dreamsecurity.jcaos.ucpid.UCPIDStatus" %>
<%@ page import="com.dreamsecurity.jcaos.ucpid.UCPIDStatusCode" %>
<%@ page import="com.dreamsecurity.jcaos.util.Arrays" %>
<%@ page import="com.dreamsecurity.jcaos.util.encoders.Base64" %>
<%@ page import="com.dreamsecurity.jcaos.util.encoders.Hex" %>
<%@ page import="com.dreamsecurity.jcaos.x509.X509CertVerifier" %>
<%@ page import="com.dreamsecurity.jcaos.x509.X509Certificate" %>

<%!
class UCPIDRequestProcess {

	private String _cpCode = null;
	private X509Certificate _ispSignCert = null;
	private PKCS8PrivateKeyInfo _ispSignKey = null;
	private X509Certificate _ispKmCert = null;
	private String _hashAlg = "SHA256";
	private X509Certificate _userSignCert = null;
	private byte[] _ispReqInfoNonce = null;
	private String _ispUrlInfo = null;
	private byte[] _keyHash = null;

	// 본인확인 기관 정보
	// 금융결제원
	private String[] yessignOidList = { // 허용 인증서 식별정보 
		// 범용
		"1.2.410.200005.1.1.1","1.2.410.200005.1.1.1.1","1.2.410.200005.1.1.1.2","1.2.410.200005.1.1.1.3","1.2.410.200005.1.1.1.4","1.2.410.200005.1.1.1.5","1.2.410.200005.1.1.1.6",
		// 은행용
		"1.2.410.200005.1.1.4","1.2.410.200005.1.1.4.1","1.2.410.200005.1.1.4.2","1.2.410.200005.1.1.4.3","1.2.410.200005.1.1.4.4","1.2.410.200005.1.1.4.5","1.2.410.200005.1.1.4.6"
	};
	private String yessignServerIp = "0.0.0.0";
	private int yessignServerPort = 0;
	
	// 코스콤
	private String[] signKoreaOidList = { // 허용 인증서 식별정보
		// 범용
		"1.2.410.200004.5.1.1.5",
		// 증권용
		"1.2.410.200004.5.1.1.9"
	};
	private String signKoreaServerIp = "0.0.0.0";
	private int signKoreaServerPort = 0;

	// 정보인증
	private String[] kicaOidList = { // 허용 인증서 식별정보
		// 범용
		"1.2.410.200004.5.2.1.2",
		// 은행용
		"1.2.410.200004.5.2.1.7.1"
	};
	private String kicaServerIp = "121.254.188.161";
	private int kicaServerPort = 9090; // 9090:직접요청시, 9091:연계기관요청시

	// 전자인증
	private String[] crossCertOidList = { // 허용 인증서 식별정보
		// 범용	
		"1.2.410.200004.5.4.1.1"
	};
	private String crossCertServerIp = "0.0.0.0";
	private int crossCertServerPort = 0;
	
	public UCPIDRequestProcess(String cpCode, X509Certificate signCert, PKCS8PrivateKeyInfo signKey, X509Certificate kmCert)
	{
		this._cpCode = cpCode;
		this._ispSignCert = signCert;
		this._ispSignKey = signKey;
		this._ispKmCert = kmCert;
	}

	public void setHashAlg(String hashAlg)
	{
		this._hashAlg = hashAlg;
	}
	
	public byte[] getIspReqInfoUcpidNonce()
	{
		return this._ispReqInfoNonce;
	}
	
	public String getIspUrlInfo()
	{
		return this._ispUrlInfo;
	}
	
	public byte[] getIssuerKeyHash()
	{
		return this._keyHash;
	}
	
	public X509Certificate getUserSignCert()
	{
		return this._userSignCert;
	}

	public X509Certificate getSignerCert(SignedData signedData)
	{
		try {
			ArrayList<SignerInfo> signerInfos = signedData.getSignerInfos();
			SignerInfo signerInfo = (SignerInfo)signerInfos.get(0);
			return signedData.getSignerCert(signerInfo.getSid());
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	public boolean areEquals(X509Certificate cert, X509Certificate otherCert)
	{
		boolean method = true;

		if(method)
		{
			return Arrays.areEqual(cert.getEncoded(), otherCert.getEncoded());
		}
		else
		{
			try {
				if(!cert.getSerialNumber().equals(otherCert.getSerialNumber()))
					return false;
				if(!cert.getIssuerDN().getName().equalsIgnoreCase(otherCert.getIssuerDN().getName()))
					return false;
	
				return true;
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		
		return false;
	}
	
	public Date getSigningTime(SignedData signedData)
	{
		try {
			ArrayList<SignerInfo> signerInfos = signedData.getSignerInfos();
			SignerInfo signerInfo = (SignerInfo)signerInfos.get(0);
			return signerInfo.getSigningTime();
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	
	public boolean isValidTime(Date signTime, int gapSeconds)
	{
		Date current = new Date();
		long curTime = current.getTime();
		long time = signTime.getTime();
		
		long diff = ((curTime > time) ? curTime - time : time - curTime) / 1000;
		if(diff < gapSeconds)
			return true;
		
		return false;
	}

	public boolean verifyCert(X509Certificate userCert, String cachePath) 
	{
		boolean result = false;
		
		try {
			// 캐시경로 설정
			X509CertVerifier verifier = new X509CertVerifier(cachePath);

			// 최상위 인증서 설정
			String kisa_RootCa_4 = "MIIDdTCCAl2gAwIBAgIBATANBgkqhkiG9w0BAQsFADBkMQswCQYDVQQGEwJLUjENMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgQ2VudHJhbDEWMBQGA1UEAwwNS0lTQSBSb290Q0EgNDAeFw0xMDA3MTIwOTI2MjFaFw0zMDA3MTIwOTI2MjFaMGQxCzAJBgNVBAYTAktSMQ0wCwYDVQQKDARLSVNBMS4wLAYDVQQLDCVLb3JlYSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBDZW50cmFsMRYwFAYDVQQDDA1LSVNBIFJvb3RDQSA0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxepOYmiYpxFdu6SCSVgMCrAgswLbRSYg/+0tah/CjIHMn2Ja506fpsyfhyN/pX4nfEFXhQsVtTaGNAkB+/cfrPOaupueh4pbwZc7KYo4maUtK7tDj3F6iuxaa7jwAWW2/FKY0jQfBkVV9V+jfPVDJokEFGNn63zYiLcIQBaoPcQ/mJ8PKR+gGBhgUFxIWKQvi+5croilzcu+Igm/nv93uqdBUCroBo3ttTo+IfUHuj13nOO8VbABGRA53JPV4V3iDQBG3WPgSVjak/AQf7MP8F7HyGr42/oFI8Lb+O9W4MWGMamyYkidxGBdrcb61qcjQQnDNWrbFsOrmKwJYv28MwIDAQABozIwMDAdBgNVHQ4EFgQUyNCOx0muHyBCskt/E8l3WAyhzcEwDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAm/GuDMpPb886Fk8nTUHVaG8gWq8JwN2sONS84IrQOn0KqM1zYGXuXhv8H2HKeBahLKRBQKfXqfo9WSdtdTLw3Awo1EGVQDnMYpaNMHI3fulEJ8ZCWwPCzu4BsG583iYnG+54Oatjr5AUU0vZGMNBsMVkZf0aFg9PCJ0PSKg/iFQb48prJ0Iy5k7KXllIisQNuZlyreATdtNU0ajYW9WHXFYC/warjyd7bSz9KmUuMjQ3xA5LW3dkC1QLa+RHgg5lNlMNMr+sq3+cFY8LncxMby9jqL7Wx37fjdqbQ5kwjHcnSHFe9AHu6GSd/425e2ApHFXDYnh6+m0bGkNNrg8/GQ==";
			String kisa_Test_RootCa_4 = "MIIDfTCCAmWgAwIBAgIBEDANBgkqhkiG9w0BAQUFADBpMQswCQYDVQQGEwJLUjENMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgQ2VudHJhbDEbMBkGA1UEAwwSS0lTQSBUZXN0IFJvb3RDQSA0MB4XDTA1MDgyNDAxMjcyNloXDTE1MDgyNDAxMjcyNlowaTELMAkGA1UEBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRpb24gQXV0aG9yaXR5IENlbnRyYWwxGzAZBgNVBAMMEktJU0EgVGVzdCBSb290Q0EgNDCCASAwDQYJKoZIhvcNAQEBBQADggENADCCAQgCggEBAJ5JASvV+y7UgOYyQ98R51vPTdhvRE0bf/gH44o1wscNtf2HgGVOoPOY+Cy5a6WRppyL607NEgC9fXSW8rOzY3B44DIdQO0lNEvvoNC6ivWB/IZ9mCVUztZvje2ea7cKJbJOgdl6ftX6ep63XqMYDAKrTH+W6bu64ila7dzhPpJehR1tRaRvYn0VUqUFPAwWEgmGErtxQp9gt38/sYa/kxHNHYUFcs4WBcG/w8HNpmySGnFqaHUOh9yhv8cjkbUWPk2WsHwFS8GFZUPvjU2QS6FUu30Tf93EDHfmcA2oQl50mZA9k9RdCdNs8sxf0fk5NOUwzFExy5z6FRZDhm8CA/UCAQOjMjAwMB0GA1UdDgQWBBQlh98+GBySwGwulnfUSgCVWQd2STAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBBQUAA4IBAQBKbVPWFd2oNOsVOOLbkcDeQ7+qLEXuZcqha1h5vsyaqMfxHTpn+VBFNFfeGsGRJDIPi6D324gpZa32vGosG/qwrFcnnEa522fQmF1estZwJrjOoyzNKdBlmn8z3hZqxBEl5Yfus54EIkfNZrpBjsacW5WiDAI0OaSvJgHpR4h5bDdyFCkc648/K2c5UOrXY661dn68QDwGK5HGFCWwOmtEyx4y4UYq4ZgsO/UfIK9j2mCBGllM0P97CCudvx3x9baebhfoZ9TQtGRXdN4EnON3ZZgtsuRw1NYR3yuUr881zOy2gyAjp9nGyxOgdFj9nRA1MMuzBy4O09npn89tqdZL";
			String kisa_Test_RootCa_7_1 = "MIIDfzCCAmegAwIBAgIBATANBgkqhkiG9w0BAQsFADBpMQswCQYDVQQGEwJLUjENMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgQ2VudHJhbDEbMBkGA1UEAwwSS2lzYSBUZXN0IFJvb3RDQSA3MB4XDTE4MDExMjA2MjExNFoXDTM4MDExMjA2MjExNFowaTELMAkGA1UEBhMCS1IxDTALBgNVBAoMBEtJU0ExLjAsBgNVBAsMJUtvcmVhIENlcnRpZmljYXRpb24gQXV0aG9yaXR5IENlbnRyYWwxGzAZBgNVBAMMEktpc2EgVGVzdCBSb290Q0EgNzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAM9w+4VwDBSX/TBsb/dsN9ZLVfLoemmMJ4w37yxY6VGFHAe8OHU7n6aj+t+sBExTqxbqgbyfn63PI7Kx6BZ+gTGPUBJ3uDGQ40U7ObirZfMYN7qrrllaU6p6K5RBi13+TXgpsYqItUDBiMI9/60k4uYrldAKyvQaWyDqDzW4RiDEIhBVrkEggB5kV9aLTIKQ75NGHiQ74sFmolE83M3t7iojhj3SzKVEpyGmkSABnbosj/SP2Gf6829WrwPs+0xPehSLcXZjbOsnz287v7bim9JST2oUARZodI6aKnYM2hy3+StpZJR32/x2IC3KiksKZlkceA++6cos7H4cJn1iHHsCAwEAAaMyMDAwHQYDVR0OBBYEFFjKF4mwhfh43NN6vwHyoEA89cHYMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEBACb0KZD0qxehGKi3MqrWD9ALPWkxb8zO+sXE310RmGZW7Qojimv4bQtdnImSP8Tb04tAYuD0G4C2aXcR55TyZiKVF8GQa9ZGZYc/pYhcsUXW+1KedmUvENk3Cr/gc+mrlUD6V6md5AMXua77/GcZ3S/bTeLhKvjfW86Tbak0cfhrmTNawaMVUJKxG+T2A8ealAcLeDWulS6VtAK09Cuw+Zpa9/E1E3Q1/uh9Kk0W/OnODaEVXCN59aGbjlkoGHP5qF+ic0tEFY2MyKAqDC9sy0xDpR8okh3DlGjCyOP5z9ZAihN2wi8rm6mGYeie3f+uN6xL8vsc+LARNhozJpu40jk=";
			String kisa_Test_RootCa_7_11 = "MIIFaTCCBFGgAwIBAgIBCzANBgkqhkiG9w0BAQsFADBpMQswCQYDVQQGEwJLUjENMAsGA1UECgwES0lTQTEuMCwGA1UECwwlS29yZWEgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkgQ2VudHJhbDEbMBkGA1UEAwwSS2lzYSBUZXN0IFJvb3RDQSA3MB4XDTE4MDExNzAwMzg0M1oXDTI4MDExNzAwMzg0M1owTTELMAkGA1UEBhMCS1IxDTALBgNVBAoMBEtJQ0ExFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEYMBYGA1UEAwwPc2lnbkdBVEUgRlRDQTA2MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlgnaBDKqybVMXfefY1fpHHy33OkdjmN/1m+N/pioWD0Fl6zKCNafda02m9S9JMLiDkaHo7Y1barR98XitI9bmvhCsEduidbwFusvXnJQH2Bo12ZN4MBv7rSFYJa5JX1Vpr7i7ZgyVLtxm3cXZrIARVqteu24vMXNC/ntCV+4K+qlof3FAGuGn5ixTkYpF4SSrRZKwgg6INR8NO5wvyW1lPE/tUvCQRU+IVpqo9xaQbq47OrzWC7fDf+1F7jr2gz54Nx25TVNuaqplRfVpqaqta83vf+UnPZbVHA392B/VsNWOW9CEtUOsik+32wD+Ls4qye+IW7LTtS7UUGfW+JQWwIDAQABo4ICNjCCAjIwgZMGA1UdIwSBizCBiIAUWMoXibCF+Hjc03q/AfKgQDz1wdihbaRrMGkxCzAJBgNVBAYTAktSMQ0wCwYDVQQKDARLSVNBMS4wLAYDVQQLDCVLb3JlYSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBDZW50cmFsMRswGQYDVQQDDBJLaXNhIFRlc3QgUm9vdENBIDeCAQEwHQYDVR0OBBYEFI9v9uiJcWoCA9t6Ko5VqFPn0MwzMA4GA1UdDwEB/wQEAwIBBjB8BgNVHSABAf8EcjBwMG4GBFUdIAAwZjAwBggrBgEFBQcCARYkaHR0cDovL3d3dy5yb290Y2Eub3Iua3IvcmNhL2Nwcy5odG1sMDIGCCsGAQUFBwICMCYeJMd0ACDHeMmdwRyylAAgwtzV2MapACDHeMmdwRzHhbLIsuQALjAuBgNVHREEJzAloCMGCSqDGoyaRAoBAaAWMBQMEu2VnOq1reygleuztOyduOymnTASBgNVHRMBAf8ECDAGAQH/AgEAMA8GA1UdJAEB/wQFMAOAAQAwgZcGA1UdHwSBjzCBjDCBiaCBhqCBg4aBgGxkYXA6Ly9jYXRlc3Quc2lnbmdhdGUuY29tOjM4OS9jbj1LaXNhIFRlc3RSb290Q0EgNyxvdT1Lb3JlYSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBDZW50cmFsLG89S0lTQSxjPUtSP2F1dGhvcml0eVJldm9jYXRpb25MaXN0MA0GCSqGSIb3DQEBCwUAA4IBAQBHmQLyeJSmzIDFRFP6FRfU5pCiVJgpv8jU+kW7j07OtFP12zSjO2zGJUg5OgvyA0em83G07z3ncREGPcwvO9BT5J5H3wujOHDmnyC/yL1G9wwPmh5TicMHL56T7nlKLZm4szM+/qj9j7/j2yoZ5Qo4igaVH+MdPkeVjtEyNwaMORAYQeoqRtZIfG/FVpEfkfSjX+GXir4f3vdqoUH/DdHDzLVV9ykhePLyahiCcuKFUQHgtNu/M2paQGSLI2O6PzPrTmShGdJkaOJQy2smbQXjnWGUARvQMue93TnLHPzrOzDNRL55bJerO7pSvehBToYut5rPd7S1bzYsSVaaiQ8d";
			ArrayList<X509Certificate> trustAnchors = new ArrayList<X509Certificate>();
			trustAnchors.add(X509Certificate.getInstance(Base64.decode(kisa_RootCa_4)));
			trustAnchors.add(X509Certificate.getInstance(Base64.decode(kisa_Test_RootCa_4)));
			trustAnchors.add(X509Certificate.getInstance(Base64.decode(kisa_Test_RootCa_7_1)));
			trustAnchors.add(X509Certificate.getInstance(Base64.decode(kisa_Test_RootCa_7_11)));
			verifier.setTrustedAnchors(trustAnchors);

			// 인증서 검증 방법 설정
			verifier.setRevocationCheckMethod(/*X509CertVerifier.REVOCATION_CHECK_BY_OCSP |*/ X509CertVerifier.REVOCATION_CHECK_BY_CRL);

			// 인증서 검증
			verifier.verify(userCert);
			result = true;
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return result;
	}
	
	public String getIssuerInfo(X509Certificate cert)
	{
		try {
			String issuerDn = cert.getIssuerDN().getName();
			StringTokenizer token = new StringTokenizer(issuerDn, ",");

			for(int i=0; i<token.countTokens(); i++) {
				String item = token.nextToken();
				if(item.startsWith("o="))
					return item.substring(2);
			}

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}
	
	public boolean isValidOid(X509Certificate cert)
	{
		int i;
		
		try {
			String issuerDn = cert.getIssuerDN().getName();
			String oid = cert.getCertificatePolicies().getPolicyIdentifier(0);
			String[] oidList = null;
			
			if(issuerDn.contains("o=yessign")) // 금융결제원
				oidList = yessignOidList;
			else if(issuerDn.contains("o=SignKorea")) // 증권전산
				oidList = signKoreaOidList;
			else if(issuerDn.contains("o=KICA")) // 정보인증
				oidList = kicaOidList;
			else if(issuerDn.contains("o=CrossCert")) // 전자인증
				oidList = crossCertOidList;
			else // 지원하지 않는 본인확인 기관
				return false;

			for(i=0; i<oidList.length; i++)
			{
				if(oid.equalsIgnoreCase(oidList[i]))
					return true;
			}
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return false;
	}
	
	/**
	 * UCPID 본인확인 검증 메시지 생성
	 * @param reqNumber 트랜잭선 ID (tx_id)
	 * @param signedPersonInfoReq
	 * @return
	 */
	public UCPIDRequest getUCPIDRequest(String reqNumber, SignedData signedPersonInfoReq)
	{	
		if(reqNumber == null || signedPersonInfoReq == null)
			return null; 

		// get PersonInfoReq information
		try {
			UCPIDRequestInfo info = UCPIDRequestInfo.getInstance(signedPersonInfoReq.getContent());
			//this._personInfoReqNonce = info.getUCPIDNonce();
			this._ispUrlInfo = info.getISPUrlInfo();
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		ISPReqInfoGenerator ispReqInfoGen = new ISPReqInfoGenerator();
		SignedData signedIspReqInfo = null;

		// ISPReqInfo (version := 2)
		try {
			// cpRequestNumber 설정 :
			// ISP가 부여하는 세션정보로 이용자 개인정보를 ISP가 공인인증기관으로부터 제공받기 위해 활용 
			// 트랜잭선 ID (tx_id) 적용
			ispReqInfoGen.setCpRequestNumber(reqNumber);

			// ispKmCert 설정 : 
			// ISP의 키분배용 인증서로 연계/발급 인증기관에서 ISP로 개인정보를 안전하게 암호화하여 전송 시 활용
			if(this._ispKmCert == null)
				return null;
			ispReqInfoGen.setISPKmCert(this._ispKmCert);
			
			// signedPersonInfoReq 설정 : 
			// 개인정보제공 및 활용 동의 요청(PersonInfoReq)에 이용자 전자서명 개인키로 전자서명한 값(PKCS#7 signedData Type)
			// version이 2인 경우 개인정보제공 및 활용 동의 요청 및 모듈정보 (UCPIDRequestInfo)에 이용자 전자서명 개인키로 전자서명한 값(PKCS#7 signedData Type)
			ispReqInfoGen.setSignedPersonInfoReq(signedPersonInfoReq);

			// ISPReqInfo 생성
			signedIspReqInfo = ispReqInfoGen.generate(this._ispSignCert, this._ispSignKey, this._hashAlg);
			
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		// UCPIDRequest
		UCPIDRequestGenerator ucpidReqGen = new UCPIDRequestGenerator(); 
		try {
			// ucpidNonce 획득 :
			// 비표(Nonce)는 UCPID 요청 및 응답을 재연공격(replay attack)으로부터 안전하게 전송하기 위해 활용
			ISPReqInfo ispInfo = ISPReqInfo.getInstance(signedIspReqInfo.getContent());
			this._ispReqInfoNonce = ispInfo.getUcpidNonce();

			this._userSignCert = getSignerCert(signedPersonInfoReq);
			this._keyHash = this._userSignCert.getAuthorityKeyIdentifier().getKeyIdentifier();
			
			// issuerKeyHash 설정 :
			// 발급 공인인증기관 식별정보로 공인인증기관 공개키 해쉬값
			ucpidReqGen.setIssuerKeyHash(this._keyHash);
			
			// cpCode 설정 :
			// 연계 공인인증기관이 ISP에 부여하는 코드(12자리)
			ucpidReqGen.setCpCode(this._cpCode);
			
			// contentISPReqInfo 설정 :
			// contentISPReqInfo는 ISPReqInfo의 평문(PKCS#7 data Type) 또는, ISPReqInfo의 전자서명된 형태 (PKCS#7 SignedData Type)
			ucpidReqGen.setISPReqInfo(ContentInfo.getInstance(signedIspReqInfo.getEncoded()));
			
			// UCPIDRequest 생성
			UCPIDRequest ucpidReq = ucpidReqGen.generate();
			
			return ucpidReq;
		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return null;
	}

	public UCPIDResponse getUCPIDResponse(UCPIDRequest ucpidReq) 
	{
		TCP tcp = new TCP();
		try {
			// 사용자 인증서 발급 인증기관으로 본인확인 요청
			String issuerDn = getUserSignCert().getIssuerDN().getName();
			if(issuerDn.contains("o=yessign")) // 금융결제원
				tcp.connect(yessignServerIp, yessignServerPort);
			else if(issuerDn.contains("o=SignKorea")) // 증권전산
				tcp.connect(signKoreaServerIp, signKoreaServerPort);
			else if(issuerDn.contains("o=KICA")) // 정보인증
				tcp.connect(kicaServerIp, kicaServerPort);
			else if(issuerDn.contains("o=CrossCert")) // 전자인증
				tcp.connect(crossCertServerIp, crossCertServerPort);
			else // 지원하지 않는 본인확인 기관
				return null;
			
			byte[] req = ucpidReq.getEncoded();
			byte[] sendData = new byte[4 + req.length];
			sendData[0] = (byte)((req.length >> 24) & 0x000000FF);
			sendData[1] = (byte)((req.length >> 16) & 0x000000FF);
			sendData[2] = (byte)((req.length >>  8) & 0x000000FF);
			sendData[3] = (byte)((req.length      ) & 0x000000FF);
			System.arraycopy(req, 0, sendData, 4, req.length);
			
			tcp.send(sendData);
			
			byte[] recvLen = tcp.recv(4);
			int totalLen = (recvLen[0] << 24) | (recvLen[1] << 16) | (recvLen[2] << 8) | recvLen[3]; 
			byte[] response = tcp.recv(totalLen);
			
			return UCPIDResponse.getInstance(response);

		} catch (Exception e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		return null;
	}	
}
%>

<%
	String sResult = "";

	com.dreamsecurity.jcaos.jce.provider.JCAOSProvider.installProvider();
	com.dreamsecurity.jcaos.Environment.setLicensePath("F:/DEV/data/01.DevTools/Java/eclipse-jee-neon-3-win32/workspace_branch/MagicLine4Web/WebContent/WEB-INF/magicline/config");

	String ispSignCert = "MIIFijCCBHKgAwIBAgICMb4wDQYJKoZIhvcNAQELBQAwTTELMAkGA1UEBhMCS1IxDTALBgNVBAoMBEtJQ0ExFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEYMBYGA1UEAwwPc2lnbkdBVEUgRlRDQTA2MB4XDTIwMTExNjAxNTcwMFoXDTIxMTExNjE0NTk1OVowYjELMAkGA1UEBhMCS1IxDTALBgNVBAoMBEtJQ0ExEzARBgNVBAsMCmxpY2Vuc2VkQ0ExETAPBgNVBAsMCFJB7IS87YSwMRwwGgYDVQQDDBNLSUNBLVVDUElELUlTUChkZXYpMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAq2lBhJnO5SMTpKbk2pAKxqjDtbxvq0qk2kRPZGTE+hLBqBEL47twY2wWVOLgwgEsXSKNDAwgS8Kr0owXridkpNfm4JMtp/ujxIgC4Obz95IRgWRbqJVM4H1gyMr3ic827iWwGneUhuQc+bDe7SXt98XgO6tFCk3+Tu8FfkDsOj6+DlvksNN6uOVbQ4pt+baryNK0fucLtDdYZXpUNcvMtKfPjF1m5u94jOmVjGfHwEYUc90vSpazGYbXPaDsaWIikZC81hz6ZDg0d+eOYZXJ4GAVBd+uIbH7tUkA7aMG95B7Ue1O0w3Y99wGOZBbY9N6q7YukBGssN3jusQ6WaSetwIDAQABo4ICXTCCAlkwgZMGA1UdIwSBizCBiIAUj2/26IlxagID23oqjlWoU+fQzDOhbaRrMGkxCzAJBgNVBAYTAktSMQ0wCwYDVQQKDARLSVNBMS4wLAYDVQQLDCVLb3JlYSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBDZW50cmFsMRswGQYDVQQDDBJLaXNhIFRlc3QgUm9vdENBIDeCAQswHQYDVR0OBBYEFDsDt27m0WYMrF1J0R9f0N2wxtyIMA4GA1UdDwEB/wQEAwIGwDB0BgNVHSAEbTBrMGkGCSqDGoyaRAKBSjBcMCwGCCsGAQUFBwIBFiBodHRwOi8vd3d3LnNpZ25nYXRlLmNvbS9jcHMuaHRtbDAsBggrBgEFBQcCAjAgHh7HdAAgx3jJncEcspQAIKz1x3jHeMmdwRzHhbLIsuQwcgYDVR0RBGswaaBnBgkqgxqMmkQKAQGgWjBYDBNLSUNBLVVDUElELUlTUChkZXYpMEEwPwYKKoMajJpECgEBATAxMAsGCWCGSAFlAwQCAaAiBCDwnBBN+/tV+QyO/cksClosPpOZqU0nZH/REN9TIWOZBzBeBgNVHR8EVzBVMFOgUaBPhk1sZGFwOi8vY2F0ZXN0LnNpZ25nYXRlLmNvbTozODkvb3U9ZHAycDEzLG91PWNybGRwLG91PUFjY3JlZGl0ZWRDQSxvPUtJQ0EsYz1LUjBIBggrBgEFBQcBAQQ8MDowOAYIKwYBBQUHMAGGLGh0dHA6Ly9vY3NwdGVzdC5zaWduZ2F0ZS5jb206OTAyMC9PQ1NQU2VydmVyMA0GCSqGSIb3DQEBCwUAA4IBAQAafogOhg0hFG471g8ZirNPzbpzoagiEhtZbKglCpr0876ELJeQknY0FrAk/pGPzP4qTev4jZWjW+hdLSsEazxnqq9lR8Il1g7fyd+yVNHBSGn/33lMMDYpC4YZ5Cc6o77KynBLW4VvwWO73/FdMpTHjKEC/0UeZC6JjgdxRjJ9J175DslKd69QspLOHK00SEDD/YzLcRtW+ycMk5EC6fxLsIbKTx9y4vtMakirWOKayQIN5iMrKHIDaFKONUhx2LJ6kxnITSJd1sE+5ewJEPvlhSJM+ciHxHysbzk69gKQ3ZeY1gOQ8GwFJl9pB8rdxBjOFJh63xMHWx4kuaQI9rZz";
	String ispSignKey = "MIIFEDAaBggqgxqMmkQBDzAOBAire564AnZzxAICBAAEggTw84R40RodBRJWolD9kVP+g47bAvBwgM/KlZa1FPLjKoeVX8zAHv/FF4EhtpcHdM8bDDm5wYoEOgUI4Ns4hIGeT//+CoOU5F4joSOOR61VtLTV4cLddPwEzsfHzqrWUJxOdmcICMDrZcgItPmHoQIixQFq7NziounLx8Tz3AAMJdROf9jfJ7Lbv81Ms1m4P3cnaqGxoz0BeQ3V4ONdEfJOrmnk05rTe4afl5XthUz3tCqZ7jmMWRA++4BovAmr4ulj8BzpVL4xN0YzNAU2tmibUZS22Fbup1cIu9D82c9OLxdZ5a6LGnJbxsoivc25LV7nFE227J/SX2AdY0xwyedwqo4DotPVqgG69Bjo70j0AEdijb9eAkgeBIAxOZ8x9sqdTfmH1YnbHGT46edVh11zSxqD121YNfDJ6qUbvwWK+7Vtz/Q1rw15heSPoNXcOiZXRgWTiZLmDRM7g+6EB+z6O762O5WPs4QD3exDbVRjoEgnNZFcOEPLmMLZ8OQJ3wtkBnXqGB1//ClvSTCmMXj9HcCh3WZTnZZbqAy0JzKO5aWCrGcndh1pVIKBbQ4nIc9iIpE5SE+/673lvihMjCk45t/vt8EDlXqiHLSENbcjpFQngO+yt97YpR3z3aVR5XdcdnX5u7vzghvSvbDNA1Cajj3QBxXLoqTFo4iJChrIO4kasMsiYx12uzh4OsOGArV2qHDZ3WWE+T44Rx3r1ZuyB1BlLYkiFOBMgus3sNlOWyegap++GeD3qqTLp8AMQzS+MPL8Xa1l/CdfCbgtkZP+uFceM54h1kZfwCO/cHM85gdigBMrouwN+lq7A7XvFnjB9ZwRUfjxZeRaQUiT7GALq99ZmHPfqxrq+iZfSkr00dzTDrouaIvk9TsW68QeLKV2VQa236SEgFNG8LdyBQG48hBz2s5OLP5P071BQGbfu/LLiEWw1kkim+Wu0giAOpr/CCrF9k/3Bbk4ysxrYfaw8kNVgXlf0DulQQDWWEOdgUJC3yqTH5Jqp8VzUtZR6nf8xeNxYMCHIpNstKTV5J/QSBDzBzfoY0dsOMJLM9/972G8ybp8erYsYjyB/4JfUVGDf+lni29HihH0fehytNdixunhpjEVEl4pS5qufFMFU3pGtmiI3N2EO7VYVyQxwSSH6N98vFdsyYrb7TYMNpycm6Pwz/9yO2aRGJk4o27S1MZ18o0jlvrODT7HZR3KNDNDetiqldT31d8szrbu8IxUgxRazYkw/NoiMRVUBLjUC20+LgHvhdagUbC89lnrTfQhATTp2j+DJEC9yWNqc9Bvq4Pa0Zr9v9ePcdkAAWn4IZuIanA+iH99MlrFCMjyz8GaNjt10v+wieHLeSaiRFkSMF/90BFpedrgKXdj0tXHd8IlkO9BInkgqU937RdTTtfypshMXihIvhzaW898nBOb0PuF9nuGGQynwZtT5GGAFBrJZi8inrDHmGyrAFpb4c2gez6ax1CB3WxoamNIta9qbvL4/sZijiy3v0JB3oxtZ+19YYBgJpBRCrZCPsT8NOrf9KxEiBTJy3VNx0cEPePNHdMeeIgpGHyB6OUAp+UQGgM+cwew4fEZP/Yqv1oFdOEQ6YEkRkDWjYgC9Cw6B7sWgCP/DQdUCq60CsGVAeDchkjWX9uESjarnGAAvGbshsFqsD0AOnI+d1+u70OoPvpyow==";
	String ispSignPwd = "signgate1!";
	String ispKmCert = "MIIFLDCCBBSgAwIBAgICMb8wDQYJKoZIhvcNAQELBQAwTTELMAkGA1UEBhMCS1IxDTALBgNVBAoMBEtJQ0ExFTATBgNVBAsMDEFjY3JlZGl0ZWRDQTEYMBYGA1UEAwwPc2lnbkdBVEUgRlRDQTA2MB4XDTIwMTExNjAxNTcwMFoXDTIxMTExNjE0NTk1OVowYjELMAkGA1UEBhMCS1IxDTALBgNVBAoMBEtJQ0ExEzARBgNVBAsMCmxpY2Vuc2VkQ0ExETAPBgNVBAsMCFJB7IS87YSwMRwwGgYDVQQDDBNLSUNBLVVDUElELUlTUChkZXYpMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtBTgiV8MmdtausGjJrVY9QoSLZCD8OKTMerujvSfRkhMxLHsTGU8chPw4nX5cZuSnRLgG5I+YrAPo2eRL04CD+V0g085vd8IzScDSMwt3jAwE5KmoIvizO1b4JNp/L3XfiRUsicWgZ+GXSQbnuogzcMURTGu2WLpyxRZlaSrgxcjkNUNA9o0r7PA79JuVwcj2C6VnlkJ5ixTMFeb3tfPpYrhA6oWgZIY+orO/5uaxIZFLeMTSrxmD3V33pmkKRPd8jEyRyko74JBVK4syN6B6LItMIg8buXyl79ll2l6WBZZgWDkO9BM64gejVn2Ij9LHyx9/S4hZdW6BuyVLueCKwIDAQABo4IB/zCCAfswgZMGA1UdIwSBizCBiIAUj2/26IlxagID23oqjlWoU+fQzDOhbaRrMGkxCzAJBgNVBAYTAktSMQ0wCwYDVQQKDARLSVNBMS4wLAYDVQQLDCVLb3JlYSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eSBDZW50cmFsMRswGQYDVQQDDBJLaXNhIFRlc3QgUm9vdENBIDeCAQswHQYDVR0OBBYEFBQh2+JRhwAGgzYqXKfD3TfsOsW1MA4GA1UdDwEB/wQEAwIFIDAWBgNVHSAEDzANMAsGCSqDGoyaRAKBSjByBgNVHREEazBpoGcGCSqDGoyaRAoBAaBaMFgME0tJQ0EtVUNQSUQtSVNQKGRldikwQTA/BgoqgxqMmkQKAQEBMDEwCwYJYIZIAWUDBAIBoCIEIPCcEE37+1X5DI79ySwKWiw+k5mpTSdkf9EQ31MhY5kHMF4GA1UdHwRXMFUwU6BRoE+GTWxkYXA6Ly9jYXRlc3Quc2lnbmdhdGUuY29tOjM4OS9vdT1kcDJwMTMsb3U9Y3JsZHAsb3U9QWNjcmVkaXRlZENBLG89S0lDQSxjPUtSMEgGCCsGAQUFBwEBBDwwOjA4BggrBgEFBQcwAYYsaHR0cDovL29jc3B0ZXN0LnNpZ25nYXRlLmNvbTo5MDIwL09DU1BTZXJ2ZXIwDQYJKoZIhvcNAQELBQADggEBAHX5suFyN6L1qxxDceEjNhIdTDiyFPV2/8wWDlYjRFkuHWgQGD01y0jLG4xMHdo3zqrCHfn27onDrCW/+fbfejA9EcQmKAK/wIWUj4tB7wU2QBr0VJigTxAnUzAL0xpmx9d5hRVpSDuPrWOYcFFR6g6TKU9ZjnnWDrCdwIrbAC+fvc1Bq/dZCaOJBYsYsJzcU1ZbkfvzhKM1kqXahUK8aZzwAHKXXjOJd74UJaxRLDGWVEn7dtQ9ptvwgTR2jBjUEvsk17OIf9KFcYRnDoIAoE8eULTmD5I/mqd4qV+iG0TEFHXbHL+rnqAyPANOC1m+ZyOycEbD1y1rh5G+/13ugnM=";
	String ispKmKey = "MIIE8DAaBggqgxqMmkQBDzAOBAhIpXwMRD0NFwICBAAEggTQRxhbtwyHIDOaVJAR8312A855oVmfYWlQOqI32jLaSaYhSNTdB9VS7Tm26wOY22dpTn4/Ty3D7R6pQuqtJ5jvd66Oh0Exa4ujIGLgxKkNhr5HSj3l/uD0lGXk8DP0XJl1zuYLxcv+Hcf4VFG0AE/OxcEtEGEAmDySGSreYu2zphbYzAbRF2dKOj5MEywwamJ/Fl0EQV1wLnz9GWqlN5Qc6soMLEdab9XXNvrlRSk9oWOLKEWi8Qz7M3OgqzJ/0Arb9oprAsP7fXGRSh64xpOCT2DgvynLz5G13GRiReVctadznblh8JcKeV5GlUfLO0OMzYSGN6V4LhgqZx/g0oESio0v1Wd207tNSfG6Ga21H+UuEWRH0nRuRWZfkxwiU0i2ollafEwbbnZHcrTUAwcBbMYcZbMCwAo4OcFNjH40/sHe1Cc+e3UwVF9SBbS/ETKsW3qiPj8dq3VWne71YSwfsAbbjcJ116dZJrhOJ0M2vJ57etri/fqzwFCBvazjDMOnUiB9be10ISonELQMZl/AVMbDz9iJR7VLsJM31AnIOYprcikd9+LeqlCRfNINoKkUl9FD14vWZcy2C5nnHfE6rnw3Icih/CpiFFhFOeZrOutZpFMoJuCsawRz3n8Ut7/Ddu43GaV6P8H1CeK93CV89YKkCqBefoiQ31JXOk3edHZKNAotfZb56chs8fS/cqKYN88dgWqBpZ5vEoiA+P4TzF49xEdKkENX3L1GbHS798HL8kIpND9HVPB/5o9cVru4cs5Ag6IweKIHsbu2zWtE/ebGxxCtJJrtYM2zse5KA9PWgzC41HFS3t9oJ1iVC3cBzVcTiztTJx2EI+tbKy7x1eWilQUiF7mo/9VVsg4GfpbEWWansEQxFRKkU7HpT7wPa0TQALGAz3gPh2A//9JtJ/buI4JlY+AvNny5gCEL4VkXH7clfu7fsZwITrdaUV5nyDa0d/+8Z46O+wiqxt2heudKeyK1wu203DC4l0v9P14depitfwJZ4/CHeKziMrqvd9aWJxZa/xoUtxw2v3WBZUcP2znTKfdbpMxNWCWeLvJa+PNUMfwDY6yhnmD45yhD0q7GflGtMzSbftwFG/cHOAyC3k4P9Q1NMeOSPgJ+8fjm+KwrY2Ypf6KeSDd7NfmEi0LEEHYIdvs+wDeAzYB7U5Dymc6+uboarSj6FVHKEpjjGWXnOBJX/5a5TmC9PUnaG63K70wBdM/G79DzaRbwbJDlVMg+P4g2hSw7x2hD10V9TJGJLmbgvziNKLrMzmeENqOV0nVg+2hWNG3mPDfsy7izzn4ywlZHVlqA7+/DMdUVKULCJyDpV0jKnqQI7yh9z/UnIZsSYpyFr/vHluzRG/lon3Tt1hAh210o7bj5Pay6dk160OYpAqf0wXAYX2/VcZognjQwPr0fCGY7Fcf86W+n/uu6xAo5zpTUgGdIwmFYRsHRO+9babQa+fMSIJJan7r98z7eYm8doqZEAEDbFiNZ1I73vtSF+/VEueguR6wvzjmlOX7Nv6jn0zMsHfsAzOf8kQCauGpQINJfV4g8XbyowUh+NeIRADm5Zlq9sGdkZ/bxuZAPnQlXmAf5zs/jExk0W3TzEGuO7WBRFblpXfyj479ORpXOX9nxijmTCQI=";
	String ispKmPwd = "signgate1!";
	String signedPersonInfoReq = "";//"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";

	signedPersonInfoReq = request.getParameter("sign");
	signedPersonInfoReq = URLDecoder.decode(signedPersonInfoReq, "UTF-8");
	
	System.out.println("signedPersonInfoReq ==== " + signedPersonInfoReq);
	
	try {
		// 마이데이터 사업자로부터 전송된 signedPersonInfoReq
		SignedData signedInfo = SignedData.getInstance(Base64.decode(signedPersonInfoReq));

		// 정보제공자가 본인확인기관에 요청하기위한 처리과정
		// 1.ISP 서버 인증서 설정
		X509Certificate ispSignerCert = X509Certificate.getInstance(Base64.decode(ispSignCert));
		PKCS8 pkcs8 = new PKCS8(ispSignPwd.getBytes());
		PKCS8PrivateKeyInfo ispSignerKey = pkcs8.decrypt(Base64.decode(ispSignKey));			
		X509Certificate ispEnvCert = X509Certificate.getInstance(Base64.decode(ispKmCert));
		pkcs8 = new PKCS8(ispKmPwd.getBytes());
		PKCS8PrivateKeyInfo ispEnvKey = pkcs8.decrypt(Base64.decode(ispKmKey));			

		// 정보제공자 cpCode, 서명, 암호화용 인증서 설정
		//UCPIDRequestProcess proc = UCPIDRequestProcess.getinstance("AMdNdQPZ0GET", ispSignerCert, ispSignerKey, ispEnvCert);
		UCPIDRequestProcess proc = new UCPIDRequestProcess("AMdNdQPZ0GET", ispSignerCert, ispSignerKey, ispEnvCert);

		// 서명시간 체크 (재전송공격 방지)
		boolean timeCheck = proc.isValidTime(proc.getSigningTime(signedInfo), 300);
		System.out.println("ucpidReq check signTime = " + timeCheck);
		sResult += "<pre>";
		
		sResult += String.format("request param<br>");
		sResult += String.format("  %-17s = %s<br>", "sign", signedPersonInfoReq);
		
		sResult += String.format("<br>ucpidReq<br>");
		sResult += String.format("  %-17s = %s<br>", "check signTime", Boolean.toString(timeCheck));
		
		
		// 2.서버에서 인증기관으로 본인확인 요청
		UCPIDRequest ucpidReq = proc.getUCPIDRequest("reqnum112233", signedInfo);
		System.out.println("ucpidReq = " + (new String(Hex.encode(ucpidReq.getEncoded()))));
		//sResult += String.format("ucpidReq = %s <br><br>", (new String(Hex.encode(ucpidReq.getEncoded()))));
		sResult += String.format("  %-17s = %s<br>", "message", (new String(Hex.encode(ucpidReq.getEncoded()))));
		
		
		String issuerKeyHash = new String(Hex.encode(proc.getIssuerKeyHash()));
		System.out.println("ucpidReq issuerKeyhash = " + issuerKeyHash);
		sResult += String.format("  %-17s = %s<br>", "issuerKeyhash", issuerKeyHash);
		
		//String personInfoReqUcpidNonce = new String(Hex.encode(proc.getPersonInfoReqUcpidNonce()));
		//System.out.println("ucpidReq personInfoReqNonce = " + personInfoReqUcpidNonce);
		String ispReqInfoUcpidNonce = new String(Hex.encode(proc.getIspReqInfoUcpidNonce()));
		System.out.println("ucpidReq ispReqInfoNonce = " + ispReqInfoUcpidNonce);
		sResult += String.format("  %-17s = %s<br>", "ispReqInfoNonce", ispReqInfoUcpidNonce);
		
		// 서명자 인증서  획득
		X509Certificate userCert = proc.getUserSignCert();
		String userSignCert = new String(Hex.encode(userCert.getEncoded()));
		System.out.println("ucpidReq userCert = " + userSignCert);
		sResult += String.format("  %-17s = %s<br>", "userCert", userSignCert);
		
		// 인증서 검증
		System.out.println("ucpidReq userCert verify = " + proc.verifyCert(userCert, "."));
		sResult += String.format("  %-17s = %s<br>", "  verify", Boolean.toString(proc.verifyCert(userCert, ".")));
		
		// 본인확인 기관 및 허용 인증서 식별자 확인
		String issuerCa = proc.getIssuerInfo(userCert);
		boolean validCertCheck = proc.isValidOid(userCert); 
		System.out.println("ucpidReq userCert oid check = " + validCertCheck);
		//sResult += String.format("ucpidReq userCert oid check =  %s <br><br>", Boolean.toString(validCertCheck));
		sResult += String.format("  %-17s = %s<br>", "  oid check", Boolean.toString(validCertCheck));
		
		// 인증서 동일성 비교
		System.out.println("ucpidReq compareSignerCert = " + proc.areEquals(userCert, userCert));
		sResult += String.format("  %-17s = %s<br>", "compareSignerCert", Boolean.toString(proc.areEquals(userCert, userCert)));
		
		sResult += String.format("<br>ucpidResponse<br>");
		UCPIDResponse ucpidRsp = proc.getUCPIDResponse(ucpidReq);

		// 3.본인확인 응답 처리
		byte[] issKeyHash = ucpidRsp.getIssuerKeyHash();
		UCPIDStatus state = ucpidRsp.getUcpidStatus();
		UCPIDStatusCode code = state.getStatus();
		System.out.println("ucpidResponse status = " + code.isOkay());
		sResult += String.format("  %-17s = %s<br>", "status", Boolean.toString(code.isOkay()));
		
		
		String[] freeText = state.getStatusString();
		System.out.println("ucpidResponse freeText = " + freeText[0]);
		sResult += String.format("  %-17s = %s<br>", "freeText", freeText[0]);
		
		SignedData signedPersInfo = ucpidRsp.getPersonInfo(ispEnvCert, ispEnvKey);
		PersonInfo personInfo = PersonInfo.getInstance(signedPersInfo.getContent());

		System.out.println("PersonInfo ");
		System.out.println("  version \t= " + personInfo.getVersion());
		System.out.println("  ucpidNonce \t= " + new String(Hex.encode(personInfo.getUcpidNonce())));
		System.out.println("  cpReqNumber \t= " + personInfo.getCpRequestNumber());
		System.out.println("  certDn \t= " + personInfo.getCertDn().getName());
		System.out.println("  cpCode \t= " + personInfo.getCpCode());
		System.out.println("  di \t\t= " + personInfo.getDi());
		System.out.println("  realName \t= " + personInfo.getRealName());		
		System.out.println("  gender \t= " + (personInfo.getGender() == 0 ? "female" : "male"));
		System.out.println("  nationalInfo \t= " + (personInfo.getNationalInfo() == 0 ? "resident" : "foreigner"));
		System.out.println("  birthDate \t= " + personInfo.getBirthDate());
		//System.out.println("  ciupdate \t= " + personInfo.getCiupdate());
		System.out.println("  ci \t\t= " + personInfo.getCi());
		//System.out.println("  ci2\t\t= " + personInfo.getCi2());
		
		sResult += String.format("<br>PersonInfo <br>");
		sResult += String.format("  %-17s = %s<br>", "version",		personInfo.getVersion());
		sResult += String.format("  %-17s = %s<br>", "ucpidNonce",	new String(Hex.encode(personInfo.getUcpidNonce())));
		sResult += String.format("  %-17s = %s<br>", "cpReqNumber",	personInfo.getCpRequestNumber());
		sResult += String.format("  %-17s = %s<br>", "certDn", 		personInfo.getCertDn().getName());
		sResult += String.format("  %-17s = %s<br>", "cpCode",		personInfo.getCpCode());
		sResult += String.format("  %-17s = %s<br>", "di",			personInfo.getDi());
		sResult += String.format("  %-17s = %s<br>", "realName",		personInfo.getRealName());
		sResult += String.format("  %-17s = %s<br>", "gender",		(personInfo.getGender() == 0 ? "female" : "male"));
		sResult += String.format("  %-17s = %s<br>", "nationalInfo",	(personInfo.getNationalInfo() == 0 ? "resident" : "foreigner"));
		sResult += String.format("  %-17s = %s<br>", "birthDate",	personInfo.getBirthDate());
		//sResult += String.format("  %-17s = %s<br>", "ciupdate",		personInfo.getCiupdate());
		sResult += String.format("  %-17s = %s<br>", "ci",			personInfo.getCi());
		//sResult += String.format("  %-17s = %s<br>", "ci2",			personInfo.getCi2());
		sResult += "</pre>";		
	} catch (Exception e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}	
%>
<jsp:include page="include/header.jsp"></jsp:include>
<jsp:include page="include/menu.jsp"></jsp:include>

<div id="middle">
	<h2>UCPIDRequest Result</h2>
	<div id="workArea"><!-- DIV START  -->
		<table style="width:90%; height:100%"  class="styledLeft">
		<thead>
		<tr>		
			<th colspan="2">Description</th>		
		</tr>
		</thead>
		<tr>
			<td>
			<div style="overflow-x:scroll; width: 1300px">
				<%=sResult%>
			</div>
			</td>
		</tr>
		</table>
	</div>
</div>

<jsp:include page="include/footer.jsp"></jsp:include>