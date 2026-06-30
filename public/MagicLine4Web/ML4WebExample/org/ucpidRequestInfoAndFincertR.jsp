<%@page import="java.io.InputStream"%>
<%@page import="java.io.FileInputStream"%>
<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.dreamsecurity.magicline.JCaosCheckCert"%>
<%@ page import="com.dreamsecurity.magicline.JCaosCheckCertInt"%>
<%@ page import="com.dreamsecurity.jcaos.x509.X509CertVerifier"%>
<%@ page import="com.dreamsecurity.jcaos.x509.X509Certificate"%>
<%@ page import="com.dreamsecurity.jcaos.x509.X509GeneralName"%>
<%@ page import="com.dreamsecurity.jcaos.x509.X509OtherName"%>
<%@ page import="com.dreamsecurity.jcaos.util.encoders.Base64"%>
<%@ page import="com.dreamsecurity.jcaos.util.encoders.Hex"%>
<%@ page import="com.dreamsecurity.jcaos.vid.VID"%>
<%@ page import="com.dreamsecurity.jcaos.cms.SignedData" %>
<%@ page import="java.math.BigInteger"%>
<%@ page import="java.net.URLEncoder"%>
<%@ page import="java.net.URLDecoder"%>
<%@ page import="java.util.Properties"%>
<%@ page import="java.util.ArrayList"%>
<%@ page import="java.util.Date"%>
<%@ page import="java.util.HashMap" %>
<%@ page import="com.dreamsecurity.magice2e.MagicE2E" %>

<%@ page import="java.io.BufferedReader"%>
<%@ page import="java.io.InputStreamReader"%>
<%@ page import="java.io.OutputStream"%>
<%@ page import="java.net.HttpURLConnection"%>
<%@ page import="java.net.URL"%>
<%@ page import="java.net.MalformedURLException" %>
<%@ page import="javax.net.ssl.*"%>
<%@ page import="java.security.SecureRandom"%>
<%@ page import="com.google.gson.*"%>

<%@ page import="com.dreamsecurity.jcaos.ucpid.UCPIDRequestInfo" %>


<%
	// 서명 검증 셈플
	// 클라이언트에서 받은 서명 데이타를 검증
	String sResult = "";
	
	String sVIDRandomHash = null;
	String sSourceText = "";
	String submitType = "";
	String textCheck = "";
	String sPolicy = "";
	String sidentifyData = "";
	String signOrigin = "";
	
	String sSignData = null;
	String vidRandom = "";
	String signedPersonInfoReq = "";
	String ucpidNonce = "";
	
	BufferedReader br = null;
	OutputStream os = null;
	HttpURLConnection con = null;
	
	//서명데이터를 가져온다
	sSignData = request.getParameter("sign");
	sSignData = URLDecoder.decode(sSignData, "utf-8");
	
	//ucpidInfo 서명데이터를 가져온다
	signedPersonInfoReq = request.getParameter("ucpidReqInfo");
	signedPersonInfoReq = URLDecoder.decode(signedPersonInfoReq, "utf-8");
	
	//ucpidNonce를 가져온다
	ucpidNonce = request.getParameter("ucpidNonce");
	ucpidNonce = URLDecoder.decode(ucpidNonce, "utf-8");
	System.out.println("nonCe : "+ucpidNonce);
	
	//인증서 vidRandom값을 가져온다
	vidRandom = request.getParameter("vidRandom");
	vidRandom = URLDecoder.decode(vidRandom, "utf-8");	
	
	sResult = sResult+"- SignData ["+sSignData+"]<br>\n";
	
	// 서명 데이타가 있을때 서명 검증
	if (sSignData != null && sSignData.length() > 0){
		try{
			
			/* 1. ####### 주민등록번호 E2E 복호화 시작 ####### */ 
			MagicE2E ml = (MagicE2E)session.getAttribute("Magie2e");
			String sEncData = request.getParameter("encData").replaceAll("&amp;quot;", "\"").replaceAll("&quot;", "\""); // 암호화 데이터
			HashMap<String, String> map = new HashMap<String, String>();
			StringBuffer sbPlain = new StringBuffer(); // 출력 버퍼
			System.out.println("- Encrypt Result ["+ sEncData +"]");
			
			// 암호 스트링이 있을때만 복호화
			if (sEncData != null && sEncData.length() > 0 && ml != null){
				int sDecryptResult = ml.decrypt(sEncData, sbPlain); // 복호화 상태값(0일 경우 정상)
			
				System.out.println("- sDecryptResult ["+ sDecryptResult +"]");
				System.out.println("- Decrypt Result ["+ java.net.URLDecoder.decode((String)sbPlain.toString(),"utf-8") +"]");
				
				// 복호화 데이터
				String[] parts = java.net.URLDecoder.decode((String)sbPlain.toString(),"utf-8").split("&");
				
				if( parts.length > 1){
					for (String pair : parts) {
						String[] kv = pair.split("=");
						map.put(kv[0], kv[1]);
					}	
				}else{
					String temp = java.net.URLDecoder.decode((String)sbPlain.toString(),"utf-8");
					String[] kv = temp.split("=");
					map.put( kv[0], kv[1] );
				}
			}
			/* ####### 주민등록번호 E2E 복호화 끝 ####### */
			
			
			/* 2. ####### 서명데이터 서명검증 및 본인확인 검증 ####### */
			JCaosCheckCert jcaosCheck = new JCaosCheckCert();
			// 서버가 알고 잇는 주민등록 번호를 등록한다 
			jcaosCheck.setVIDRandom(map.get("encIdn"), vidRandom);
			
			sResult = sResult+"<br>\n- 서명 검증 시작<br>\n";
			
			// 서명 검증
			// 검증후 원문이 리턴됨
			int iResult = jcaosCheck.checkCert(sSignData);
			
			if( iResult == 0 ){
				sResult = sResult+ "- 인증서 검증 성공<br>\n";
			}else if( iResult == 3000 ){
				sResult = sResult+ "- 인증서 검증 하지않음<br>\n";
			}else if (  iResult != 0 ){
				// 오류 발생시 오류를 구분
				String sCertResult = null;
				switch(iResult){
					case JCaosCheckCert.STAT_ERR_WRONGCERT							:	// 정상적인 인증서가 아님
						sCertResult = "서명에 사용된 인증서가 정상적인 인증서가 아닙니다.";	  break;
					case JCaosCheckCert.STAT_ERR_RevocationCheckException			:	// CRL 검증 실패
					case JCaosCheckCert.STAT_ERR_NotExistSignerCertException		:	// 서명자 인증서 누락
					case JCaosCheckCert.STAT_ERR_IOException						:	// IOException
					case JCaosCheckCert.STAT_ERR_FileNotFoundException				:	// FileNotFoundException
					case JCaosCheckCert.STAT_ERR_ETC								:	// 기타 오류
					case JCaosCheckCert.STAT_ERR_BuildCertPathException 			:	// 인증서 경로 구축 실패
					case JCaosCheckCert.STAT_ERR_ObtainCertPathException			:	// 인증서 경로 구축 실패
					case JCaosCheckCert.STAT_ERR_ValidateCertPathException			:	// 인증서 경로 검증 실패
					case JCaosCheckCert.STAT_ERR_TrustRootException 				:	// 신뢰할수 없는 최상위 인증서
						sCertResult = "서명 인증서 검증 오류 ["+iResult+"].";	  break;
					case JCaosCheckCert.STAT_ERR_VerifyException 					:	// 서명 검증 실패
						sCertResult = "서명 검증 실패";	  break;
					case JCaosCheckCert.STAT_ERR_CertificateNotYetValidException	: 	// 인증서 유효기간 검증 오류
						sCertResult = "서명 인증서 유효기간 검증 오류";	  break;
					case JCaosCheckCert.STAT_ERR_CertificateExpiredException 		:	// 인증서 만료
						sCertResult = "만료된 인증서 ";	  break;
					case JCaosCheckCert.STAT_ERR_RevokedCertException				:	// 폐지된 인증서
						sCertResult = "폐지된 인증서";	  break;
					// 내부망 인증서 검증하려면 위 주석 처리합니다. (4)END
					default:
						sCertResult = "기타오류 ["+iResult+"]";	  break;
				}
				sResult = "<br>\n- "+sCertResult+" \n[" + jcaosCheck.getLastErr() +"]<br>\n\n";
			}
			
			//서명검증을 성공했거나 or 하지 않았거나
			if( iResult == 0 || iResult == 3000 ){
				// 서명에 사용된 인증서를 가져온다
				X509Certificate cert = jcaosCheck.getUserCert();
				String signerDN = cert.getSubjectDN().getName();   	// 인증서 DN
				BigInteger serialNumber = cert.getSerialNumber();	// 인증서 시리얼
				
				Base64.encode(cert.getEncoded());
				cert.getEncoded();
				// 본인확인 
				switch (jcaosCheck.getVIDCheck()){
					case JCaosCheckCert.STAT_VID_NOTCHECK:
						sResult = sResult+"- 본인 확인 하지 않음<br>\n";
						break;
					case JCaosCheckCert.STAT_VID_CHECK_OK:
						sResult = sResult+"- 본인 확인 성공<br>\n";	
						break;
					case JCaosCheckCert.STAT_VID_CHECK_FAIL:
						sResult = sResult+"- 본인 확인 실패<br>\n";
						break;
					// 내부망 인증서 검증하려면 위 주석 처리합니다. (6)END
				}
				
				// 서명 값 (Base64)
				String base64SignData = sSignData;
				sSourceText = new String( jcaosCheck.getSrcByte());
				
				String resource = "/MagicLine4Web/ML4Web/js/message/Messages.js";
				Properties props = new Properties();
				try{
					
					InputStream reader = getClass().getResourceAsStream(resource);
					props.load(reader);
					
				}catch(Exception e){
					
				}
				
				sPolicy = props.getProperty("OID_" + cert.getCertificatePolicies().getPolicyIdentifier(0).replace(".", "_"));
				
				ArrayList generalNames = cert.getSubjectAlternativeName();
				if (generalNames != null && generalNames.size() > 0)
				{
					X509GeneralName genName;
					for (int i=0; i<generalNames.size(); i++) {
						genName = (X509GeneralName)generalNames.get(i);
						if (genName.getType() == X509GeneralName.TYPE_OTHER_NAME) {
							String identifyData = genName.getStringName();
							
							X509OtherName otherName = X509OtherName.getInstance(((X509GeneralName)generalNames.get(i)).getOtherName());
							VID vid = VID.getInstance(otherName.getIdentifyData().getVid());
							//sidentifyData = new String(Hex.encode(vid.getVirtualID()));
						}
					}
				}
				
				// 화면 출력값 생성
				sResult = sResult+  "<br>\n- 사용자 DN ["+signerDN+"]<br>\n"+"<br>\n";
				sResult = sResult+  "- 발급자 DN ["+cert.getIssuerDN().getName()+"]<br>\n"+"<br>\n";
				sResult = sResult+  "- 인증서 SN ["+cert.getSerialNumber().toString(16)+"]<br>\n"+"<br>\n";
				sResult = sResult+  "- 인증서 정책 ["+cert.getCertificatePolicies().getPolicyIdentifier(0)+"]<br>\n"+"<br>\n";
				sResult = sResult+  "- 인증서 구분 ["+sPolicy+"]<br>\n"+"<br>\n";
				sResult = sResult+  "- 본인확인 식별값 ["+sidentifyData+"]<br>\n"+"<br>\n";
				
				/* ####### 서명데이터 서명검증 및 본인확인 검증 끝 ####### */
				
				/* 3. UCPID PERSONAL REQUEST INFO를 통해 CI값 가져오기 */
				
				// ###### signedPersonInfoReq Check ######
				SignedData signedData1 = SignedData.getInstance(Base64.decode(signedPersonInfoReq));
		
				UCPIDRequestInfo ucpidRequestInfo = UCPIDRequestInfo.getInstance(signedData1.getContent());
			  	StringBuilder resultUCPID = new StringBuilder();
			  	
			  	resultUCPID.append("UCPIDRequestInfo =>\n");
			  	resultUCPID.append("\t version = ").append(ucpidRequestInfo.getUCPIDVersion()).append("\n");
			  	resultUCPID.append("\t , ucpidNonce = ").append(new String(Hex.encode(ucpidRequestInfo.getUCPIDNonce()))).append("\n");
			  	resultUCPID.append("\t , PersonInfoReq ").append("\n");
			  	resultUCPID.append("\t\t userAgreement = ").append(ucpidRequestInfo.getPersonInfoReq().getUserAgreement()).append("\n");
			  	resultUCPID.append("\t\t userAgreeInfo = ").append(printUserAgreeInfo(ucpidRequestInfo.getPersonInfoReq().getUserAgreeInfo())).append("\n");
			  	resultUCPID.append("\t , ModuleInfo ").append("\n");
			  	resultUCPID.append("\t\t moduleName = ").append(ucpidRequestInfo.getModuleInfo().getModuleName()).append("\n");
			    resultUCPID.append("\t\t moduleVendorName = ").append(ucpidRequestInfo.getModuleInfo().getModuleVendorName()).append("\n");
			    resultUCPID.append("\t\t moduleVersion = ").append(ucpidRequestInfo.getModuleInfo().getModuleVersion()).append("\n");
			    resultUCPID.append("\t , ISPUrlInfo = ").append(ucpidRequestInfo.getISPUrlInfo()).append("\n");
			    System.out.println("#################################### ");
			    System.out.println("값 : "+resultUCPID.toString());
			 	// ###### signedPersonInfoReq Check #####
			 	
				//토큰요청 URL
				String tokenApiUrl = "https://t-certapi.yeskey.or.kr/oauth/2.0/api/token";
				String resultMsg = getAccessToken(tokenApiUrl, con, os);
							
				/*
					ACCESS_TOKEN API 응답문 예시(금융결제원 제공)
					{
						"access_token":"eyJhbGciOiJIUzI1NiIs(...생략)",
						"token_type":"bearer",
						"expires_in":7775999,
						"scope":"status verification",
						"api_tran_id":"68f65c68-7231-4b4a-96b8-1ad5410f4c40",
						"server_id":"server_id_03"
					}
				*/
				
				/* UCPID PERSONAL REQUEST INFO를 통해 CI값 가져오기 끝*/
		    	JsonElement jsonElement = JsonParser.parseString(resultMsg);
		    	JsonObject jsonObject = jsonElement.getAsJsonObject();
		    	
		    	String access_token = jsonObject.get("access_token").getAsString();
		    	String cp_code = "Y30000000601"; //UCPID 기관코드
		    	String apiUrl = "https://t-certapi.yeskey.or.kr/v1/ucpid/ucpid-info"; //UCPID-INFO API URL
		    	
		    	
		    	/* 4. UCPID API 호출 */
		    	String ucpidResult = reqUCPID(signedPersonInfoReq, cp_code, ucpidNonce, apiUrl, access_token, con, os);
		    	System.out.println("### UCPID Request API Response###");
				System.out.println(ucpidResult);
				
				/* UCPID API 응답문 예시
				{
					   "api_tran_id":"79196c66-894f-4b5...",
					   "dn":"cn=드림테스트2()0099163202....",
					   "ci":"nNogtiNbgfPZ3aCumj/KUszpk3....",
					   "ci2":null,
					   "ci_update":1,
					   "di":"MC0GCCqGSIb3DQIJAyEAorjh....",
					   "real_name":"드림테스트",
					   "gender":1,
					   "national_info":0,
					   "birth_date":"19930303"
				}
				*/
				
				/* 5. UCPID RESPONSE 파싱 */
		    	JsonElement ucpidAPI_Response = JsonParser.parseString(ucpidResult);	    	
		    	JsonObject jsonObject2 = ucpidAPI_Response.getAsJsonObject();
		    	
		    	//※응답받은 CI문은 받은 그대로 사용(별도의 복호화나 decode 작업 X)
		    	String ci = jsonObject2.get("ci").getAsString();
		    	String di = jsonObject2.get("di").getAsString();
		    	System.out.println("ci : "+ci);
				
				//이하 비즈니스 로직 수행
				
				
			}
		}catch(Exception e){
			// 인증서 검증중 오류가 난 경우
			// 처리를 편하게 하기 위해
			// 상용중에는 사용자의 인증서의 유효성의 문제가 잇는 경우가 대부분 입니다.
			// 
			e.printStackTrace();
			sResult = "서명 검증에 실패 하였습니다.\n [" + e.getMessage()+"]\");";
		}
	}else{
		sResult=" - 서명 데이타가 존재하지 않습니다..<br>\n";
	}
%>
	
	
<%!
	public static String printUserAgreeInfo(boolean[] userAgreeInfo) {
	    StringBuffer sb = new StringBuffer();
	    if (userAgreeInfo[0])
	        sb.append("realName, ");
	    if (userAgreeInfo[1])
	        sb.append("gender, ");
	    if (userAgreeInfo[2])
	        sb.append("nationalInfo, ");
	    if (userAgreeInfo[3])
	        sb.append("birthDate, ");
	    if (userAgreeInfo[4])
	        sb.append("ci, ");
	
	    return sb.substring(0, sb.toString().length()-2);
	}
	
	//Access Token api 호출
	public String getAccessToken(String tokenUrl, HttpURLConnection con, OutputStream os) throws Exception{
		// 데이터 준비
		String clientId = "2b2d6e86-39c2-4c28-b128-345f6ad65d74"; //이용기관이 발급받은 clientId
	    String clientSecret = "a63991a1-b2fa-4f26-888e-3b1b52e34780"; //이용기관이 발급받은 clientSecret
	    String scope = "ucpid";
	    String grantType = "client_credentials"; //고정값
	    String serverId = "dream_server_01"; //임의의 값
	    String reissue = "n";
	    
	    String result = "";
	    
	    // 데이터 문자열 생성
	/*             String data = "client_secret=" + URLEncoder.encode(clientSecret, "UTF-8") +
	                  "&scope=" + URLEncoder.encode(scope, "UTF-8") +
	                  "&grant_type=" + URLEncoder.encode(grantType, "UTF-8") +
	                  "&server_id=" + URLEncoder.encode(serverId, "UTF-8") +
	                  "&reissue=" + URLEncoder.encode(reissue, "UTF-8"); */
	                  
		String data = "client_secret=" + clientSecret +
	                 "&scope=" + scope +
	                 "&grant_type=" + grantType +
	                 "&server_id=" + serverId +
	                 "&reissue=" + reissue;			
		
		System.out.println("data  : "+data);
		
		URL url = new URL(tokenUrl);
		
		if(url.getProtocol().equals("https")){
			SSLContext sc = SSLContext.getInstance("TLS");
			sc.init(null, null, new SecureRandom());
			HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
			con = (HttpsURLConnection) url.openConnection();
		}else{
			con = (HttpURLConnection) url.openConnection();
		}
		
		con.setDoOutput(true);
		con.setRequestMethod("POST");
		con.setRequestProperty("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
		con.setRequestProperty("client_id", clientId);
		os = con.getOutputStream();
		os.write(data.getBytes());
		os.flush();
	
		int responseCode = con.getResponseCode();
	    
	    if (responseCode == 200) {  // 성공적인 응답 확인
	        BufferedReader reader = new BufferedReader(new InputStreamReader(con.getInputStream()));
	        StringBuilder res = new StringBuilder();
	        String line;
	        while ((line = reader.readLine()) != null) {
	        	res.append(line);
	        }
	        reader.close();
	        
	        result = res.toString();
	        
	    } else {
	        System.out.println("HTTP 오류 코드: " + responseCode);
	        BufferedReader errorReader = new BufferedReader(new InputStreamReader(con.getErrorStream()));
	        String line;
	        StringBuilder errorResponse = new StringBuilder();
	        while ((line = errorReader.readLine()) != null) {
	            errorResponse.append(line);
	        }
	        errorReader.close();
	        System.out.println("Error Response: " + errorResponse.toString());
	        result = errorResponse.toString();
	    }
	    con.disconnect();
	    
		return result;
	}

	//UCPID api 호출
	public String reqUCPID(String ucpid_request_info, String cp_code, String ucpidNonce, String apiUrl, String accessToken, HttpURLConnection con, OutputStream os) throws Exception{
		// JSON 데이터 준비
		JsonObject jsonObject = new JsonObject();
        jsonObject.addProperty("ucpid_request_info", ucpid_request_info);
        jsonObject.addProperty("cp_code", cp_code);
        jsonObject.addProperty("ucpid_nonce", ucpidNonce);

        // Gson 객체 생성
        Gson gson = new Gson();

        // JSON 객체를 문자열로 변환
        String jsonString = gson.toJson(jsonObject);
        System.out.println("요청문: "+jsonString);
        
		String result = "";
		
		URL url = new URL(apiUrl);
		
		if(url.getProtocol().equals("https")){
			SSLContext sc = SSLContext.getInstance("TLS");
			sc.init(null, null, new SecureRandom());
			HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
			con = (HttpsURLConnection) url.openConnection();
		}else{
			con = (HttpURLConnection) url.openConnection();
		}
		
		con.setDoOutput(true);
		con.setRequestMethod("POST");
		con.setRequestProperty("Content-Type", "application/json");
		con.setRequestProperty("Authorization", "Bearer "+accessToken);
		os = con.getOutputStream();
		os.write(jsonString.getBytes());
		os.flush();
	
		// Get the response
		
		int responseCode = con.getResponseCode();
	    
	    if (responseCode == 200) {  // 성공적인 응답 확인
	        BufferedReader reader = new BufferedReader(new InputStreamReader(con.getInputStream()));
	        StringBuilder res = new StringBuilder();
	        String line;
	        while ((line = reader.readLine()) != null) {
	        	res.append(line);
	        }
	        reader.close();
	        
	        result = res.toString();
	        
	    } else {
	    	//실패메세지 확인
	        System.out.println("HTTP 오류 코드: " + responseCode);
	        BufferedReader errorReader = new BufferedReader(new InputStreamReader(con.getErrorStream()));
	        String line;
	        StringBuilder errorResponse = new StringBuilder();
	        while ((line = errorReader.readLine()) != null) {
	            errorResponse.append(line);
	        }
	        errorReader.close();
	        System.out.println("Error Response: " + errorResponse.toString());
	        result = errorResponse.toString();
	    }
	    con.disconnect();
	    
		return result;
	}

	

%>
<jsp:include page="include/header.jsp"></jsp:include>
<jsp:include page="include/menu.jsp"></jsp:include>

<div id="middle">
	<h2>MagicLine Digital Signature Result</h2>
	<div id="workArea"><!-- DIV START  -->
		<table style="width: 100%; height:100%"  class="styledLeft">
		<thead>
		<tr>		
			<th colspan="2">Description</th>		
		</tr>
		</thead>
		<tr>
			<td>사용자가 선택한 인증서를 이용하여 원문데이터에 전자서명값을 추출하여 서버에서 전자서명 검증을 실행하며<br>
				서버는 사용자 인증서의 유효성 여부를 확인한다.
			</td>
		</tr>
		</table>
		
		<p>&nbsp;</p>
		<form action="login_renewR.jsp" method="post" name="popForm">
		<table style="width: 100%" class="styledLeft">
			<thead>
				<tr>
					<th colspan="2">Client Digital Signature Request Data</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="formRow">
					<table class="normal" cellspacing="0">
						<tr>
							<td>서명원문</td>
							<td id="signOrigin"><%=signOrigin%></td>
						</tr>
						<tr>
							<td>서명결과</td>
							<td id="signResult"><%=sSourceText %></td>
						</tr>
						<tr>
							<td>일치여부</td>
							<td id="resultArea"></td>
						</tr>
					</table>
					</td>
				</tr>
			</tbody>
		</table>
		<p>&nbsp;</p>
		<table style="width: 100%" class="styledLeft">
			<thead>
				<tr>
					<th colspan="2">Client Certificate Information</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="formRow">
					<table class="normal" cellspacing="0">
						<tr>
							<td>sResult:</td>
							<td><%=sResult%></td>
						</tr>						
					</table>
					</td>
				</tr>
			</tbody>
		</table>
		</form>
		<p>&nbsp;</p>
	</div>
</div>
<script type="text/javascript">
$(window).load(function(){
	
	var origin = $("#signOrigin").text();
	var result = $("#signResult").text();
	var resultDOM = document.getElementById("resultArea");
	
	if(origin == result){
		resultDOM.innerHTML = "<b><font color='green'>MATCHED</font></b>";
	}else{
		resultDOM.innerHTML = "<b><font color='red'>MISMATCHED</font></b>";
	}
	
});
</script>
<jsp:include page="include/footer.jsp"></jsp:include>