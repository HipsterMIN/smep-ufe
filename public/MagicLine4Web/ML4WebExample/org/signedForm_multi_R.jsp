<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page import="com.dreamsecurity.magicline.JCaosCheckCert"%>
<%@ page import="com.dreamsecurity.magicline.json.*"%>
<%@ page import="com.dreamsecurity.magicline.JCaosCheckCertInt"%>
<%@ page import="com.dreamsecurity.jcaos.x509.X509CertVerifier"%>
<%@ page import="com.dreamsecurity.jcaos.x509.X509Certificate"%>
<%@ page import="com.dreamsecurity.jcaos.x509.X509GeneralName"%>
<%@ page import="com.dreamsecurity.jcaos.x509.X509OtherName"%>
<%@ page import="com.dreamsecurity.jcaos.util.encoders.Base64"%>
<%@ page import="com.dreamsecurity.jcaos.util.encoders.Hex"%>
<%@ page import="com.dreamsecurity.jcaos.vid.VID"%>
<%@ page import="java.math.BigInteger"%>
<%@ page import="java.net.URLDecoder"%>
<%@ page import="java.util.Properties"%>
<%@ page import="java.util.ArrayList"%>

<%
	// 서명 검증 셈플
	// 클라이언트에서 받은 서명 데이타를 검증
	String sResult = "";
	String sSignData = null;
	String sVIDRandomHash = null;
	String sSourceText = "";
	String submitType = "";
	String textCheck = "";
	String sPolicy = "";
	String sidentifyData = "";
	String signOrigin = "";
	
	// 18.07.10 : 결과 확인을 위해 서명 원문 데이터를 가져온다
	signOrigin = request.getParameter("signOrigin");
	if(signOrigin != null){
		signOrigin = new String(signOrigin.getBytes("8859_1"), "utf-8");
	}
	
	// 서명 데이타를  가져옴 
	// 본 셈플에서는 서명 값을 Post Data 의 SignData 에 넣어서 보낸다고 간주 코딩 한다
	sSignData = request.getParameter("sign");
	sSignData = URLDecoder.decode(sSignData, "utf-8");
	
	Object jsonObject = null;
	jsonObject = (new JSONParser()).parse(sSignData);
	System.out.println(jsonObject);
	JSONArray obj = (JSONArray)jsonObject;
	
	for(int j=0; j<obj.size(); j++){
		sSignData = obj.get(j).toString();
		sResult = sResult+"- SignData ["+sSignData+"]<br>\n";

		// 서명 데이타가 있을때 서명 검증
		if (sSignData != null && sSignData.length() > 0){
			try{
				// 내부망 인증서 검증하려면 아래 주석 처리합니다. (1) (1~6번)
				JCaosCheckCert jcaosCheck = new JCaosCheckCert();
				
				// 내부망 인증서 검증하려면 아래 주석 해제합니다. (2)
				// 내부망 인증서 검증 설정 START
				/* JCaosCheckCertInt jcaosCheck = new JCaosCheckCertInt();
				
				String sConfPath  =  "D:/ML4W/WS_svn/ML4W/MagicLine4Web/WebContent/WEB-INF/magicline/";   // cofn경로, 앍고 쓰기 가능해야함
				String sCertPath   =  sConfPath +"certs/";  // RootCa정보
				String sConfigPath =  sConfPath +"conf/ca_env_info.conf";  //인증기관 LDAP정보
				
				// ROOT 인증서를 세팅한다
				// 검증하려는 인증서의 ROOT를 설정한다
				// 기본 설정은 NPKI 1024,2048 상용 인증서만 검증
				String sRootCerts[] = 	
					{	
					// NPKI 인증서 처리를 위한 Root 인증서
					sCertPath+"GPKIRootCA1.der",		
					sCertPath+"GPKIRootCA2.der",
					sCertPath+"GPKIRootCA3.der",
					sCertPath+"KISARootCA1.der",
					sCertPath+"KISARootCA4.der"
					};
				// OCSP 검증을 위한 세팅 
				String sOCSPUrl = null; 
				byte[] byOCSPCert = null;
				byte[] byOCSPPriKey = null;
				String sOCSPPassword = null;
				int iOCSPCheckMethod = X509CertVerifier.REVOCATION_CHECK_BY_CRL;													// CRL  만 검증

				int iRes = jcaosCheck.init(sConfigPath, sRootCerts, sOCSPUrl, byOCSPCert, byOCSPPriKey,sOCSPPassword, iOCSPCheckMethod);
				
				if (iRes != 0)
					System.out.println("- JCaosCheckCert.init Fail ["+iRes+"]<br>"); 
				else
					System.out.println("- JCaosCheckCert.init Success!!!<br>");
				
				jcaosCheck.setCRL(true, sConfPath + "config/urlconfig.properties");
				jcaosCheck.setCertVerifyDir(sConfPath + "/conf"); */
				// 내부망 인증서 검증 설정 END
			
				// 인증서 검증전에 본인 확인을 하기 위한  VIDRandomHash 값이 있으면 설정한다
				// 본인확인 방법은 
				// 1. 주민번호 + VIDRandom	: jcaosCheck.setVIDRandom("주민등록번호(사업자번호)", "VIDRandom 값")
				// 2. VidRandomHash         : jcaosCheck.setVIDRandomHash("VIDHash 값") 
				// 상기 둘중 하나의 방법으로 가능하다
				// 본 셈플에서는 VIDRandomHash 로 검증을 한다
				// 참고로 VID값이 설정 안되면 본인확인을 하지 않는다
				//jcaosCheck.setVIDRandomHash(sVIDRandomHash);
				
				sResult = sResult+"<br>\n- 서명 검증 시작<br>\n";
				
				// 서명 검증
				// 검증후 원문이 리턴됨
				int iResult = jcaosCheck.checkCert(sSignData);
				
				/*
				- JCaosCheckCert.checkCert 의 에러코드는 하기와 같습니다.
				JCaosCheckCert.STAT_OK										// 성공
				JCaosCheckCert.STAT_ERR_WRONGCERT							// 정상적인 인증서가 아님
				JCaosCheckCert.STAT_ERR_ETC									// 기타 오류
				JCaosCheckCert.STAT_ERR_VerifyException 					// 서명 검증 실패
				JCaosCheckCert.STAT_ERR_CertificateNotYetValidException 	// 인증서 유효기간 검증 오류
				JCaosCheckCert.STAT_ERR_CertificateExpiredException 		// 인증서 만료
				JCaosCheckCert.STAT_ERR_ObtainCertPathException				// 인증서 경로 구축 실패
				JCaosCheckCert.STAT_ERR_BuildCertPathException 				// 인증서 경로 구축 실패
				JCaosCheckCert.STAT_ERR_TrustRootException 					// 신뢰할수 없는 최상위 인증서
				JCaosCheckCert.STAT_ERR_ValidateCertPathException			// 인증서 경로 검증 실패
				JCaosCheckCert.STAT_ERR_RevokedCertException				// 폐지된 인증서
				JCaosCheckCert.STAT_ERR_RevocationCheckException			// CRL 검증 실패
				JCaosCheckCert.STAT_ERR_NotExistSignerCertException			// 서명자 인증서 누락
				JCaosCheckCert.STAT_ERR_IOException							// IOException
				JCaosCheckCert.STAT_ERR_FileNotFoundException				// FileNotFoundException
				JCaosCheckCert.STAT_ERR_NoSuchAlgorithmException			// NoSuchAlgorithmException
				JCaosCheckCert.STAT_ERR_NoSuchProviderException 			// NoSuchProviderException 
				JCaosCheckCert.STAT_ERR_ParsingException        			// ParsingException        
				JCaosCheckCert.STAT_ERR_IdentifyException       			// 본인확인 실패       
				*/
				if( iResult == 0 ){
					sResult = sResult+ "- 인증서 검증 성공<br>\n";
				}else if( iResult == 3000 ){
					sResult = sResult+ "- 인증서 검증 하지않음<br>\n";
				}else if (  iResult != 0 ){
					// 오류 발생시 오류를 구분
					String sCertResult = null;
					switch(iResult){
						// 내부망 인증서 검증하려면 아래 주석 해제합니다. (3)
						/* case JCaosCheckCertInt.STAT_ERR_WRONGCERT							:	// 정상적인 인증서가 아님
							sCertResult = "서명에 사용된 인증서가 정상적인 인증서가 아닙니다.";	  break;
						case JCaosCheckCertInt.STAT_ERR_RevocationCheckException			:	// CRL 검증 실패
						case JCaosCheckCertInt.STAT_ERR_NotExistSignerCertException		:	// 서명자 인증서 누락
						case JCaosCheckCertInt.STAT_ERR_IOException						:	// IOException
						case JCaosCheckCertInt.STAT_ERR_FileNotFoundException				:	// FileNotFoundException
						case JCaosCheckCertInt.STAT_ERR_ETC								:	// 기타 오류
						case JCaosCheckCertInt.STAT_ERR_BuildCertPathException 			:	// 인증서 경로 구축 실패
						case JCaosCheckCertInt.STAT_ERR_ObtainCertPathException			:	// 인증서 경로 구축 실패
						case JCaosCheckCertInt.STAT_ERR_ValidateCertPathException			:	// 인증서 경로 검증 실패
						case JCaosCheckCertInt.STAT_ERR_TrustRootException 				:	// 신뢰할수 없는 최상위 인증서
							sCertResult = "서명 인증서 검증 오류 ["+iResult+"].";	  break;
						case JCaosCheckCertInt.STAT_ERR_VerifyException 					:	// 서명 검증 실패
							sCertResult = "서명 검증 실패";	  break;
						case JCaosCheckCertInt.STAT_ERR_CertificateNotYetValidException	: 	// 인증서 유효기간 검증 오류
							sCertResult = "서명 인증서 유효기간 검증 오류";	  break;
						case JCaosCheckCertInt.STAT_ERR_CertificateExpiredException 		:	// 인증서 만료
							sCertResult = "만료된 인증서 ";	  break;
						case JCaosCheckCertInt.STAT_ERR_RevokedCertException				:	// 폐지된 인증서
							sCertResult = "폐지된 인증서";	  break; */
					
						// 내부망 인증서 검증하려면 아래 주석 처리합니다. (4)START
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
				if( iResult == 0 || iResult == 3000 ){
					// 서명에 사용된 인증서를 가져온다
					X509Certificate cert = jcaosCheck.getUserCert();
					String signerDN = cert.getSubjectDN().getName();   	// 인증서 DN
					BigInteger serialNumber = cert.getSerialNumber();	// 인증서 시리얼
					
					// 본인확인 
					switch (jcaosCheck.getVIDCheck()){
						// 내부망 인증서 검증하려면 아래 주석 해제합니다. (5)
						/* case JCaosCheckCertInt.STAT_VID_NOTCHECK:
							sResult = sResult+"- 본인 확인 하지 않음<br>\n";
							break;
						case JCaosCheckCertInt.STAT_VID_CHECK_OK:
							sResult = sResult+"- 본인 확인 성공<br>\n";
							break;
						case JCaosCheckCertInt.STAT_VID_CHECK_FAIL:
							sResult = sResult+"- 본인 확인 실패<br>\n";
							break; */
						
						// 내부망 인증서 검증하려면 아래 주석 처리합니다. (6)START
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
					
					// 서명 원문을 가져온다
					// sSourceText = jcaosCheck.getSrcStr();		// 원문의 인코딩을 알고 있어어야 한다 생략시 UTF-8 로 인코딩한다
					// String sSourceText = jcaosCheck.getSrcStr("EUC-KR");		// 원문의 인코딩을 알고 있어어야 한다 생략시 EUC-KR(그 외 인코딩도 가능) 로 인코딩한다
					//sSourceText = new String(jcaosCheck.getSrcByte());
					sSourceText += new String( jcaosCheck.getSrcByte(), "UTF-8");
					if(j !=obj.size()-1){
						sSourceText += ",";
					}
					//byte[] textByte = Base64.decode(textCheck);
					//sSourceText = new String(textByte, "UTF-8");
					
					Properties props = new Properties();
					props.load(pageContext.getServletContext().getResourceAsStream("/MagicLine4Web/ML4Web/js/message/Messages.js"));
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
								sidentifyData = new String(Hex.encode(vid.getVirtualID()));
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
	}
	
	
	//out.print(sResult);
	//System.out.println(sResult); 
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